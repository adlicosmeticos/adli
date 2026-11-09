import { supabase } from '@/lib/supabase';

export interface ReceiptData {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl?: string | null;
  base64Data?: string | null;
  customerName?: string;
  customerCity?: string;
  totalCents?: number;
  createdAt: string;
}

/**
 * Converte arquivo para Base64 ou comprime se for imagem grande
 * para garantir que o envio seja rápido e leve em qualquer conexão.
 */
export async function fileToBase64OrCompressed(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxWidth = 1600;
        const maxHeight = 1600;
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.85);
          resolve(compressed);
        } else {
          resolve((e.target?.result as string) || '');
        }
      };
      img.onerror = () => resolve((e.target?.result as string) || '');
      img.src = (e.target?.result as string) || '';
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

/**
 * Salva o comprovante (no Supabase Storage ou na tabela store_settings)
 * e gera o link direto de visualização para o WhatsApp.
 */
export async function saveReceipt(
  file: File,
  metadata: {
    customerName?: string;
    customerCity?: string;
    totalCents?: number;
  }
): Promise<{ receiptId: string; viewerUrl: string; directUrl?: string | null }> {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  const receiptId = `comp_${timestamp}_${randomSuffix}`;

  let directUrl: string | null = null;
  let base64Data: string | null = null;

  // 1. Tentar upload no Supabase Storage (bucket 'comprovantes')
  if (supabase) {
    try {
      const ext = file.name.split('.').pop() || (file.type.startsWith('image/') ? 'jpg' : 'pdf');
      const storagePath = `${receiptId}.${ext}`;

      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('comprovantes')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type || undefined,
        });

      if (!uploadErr && uploadData) {
        const { data: publicData } = supabase.storage
          .from('comprovantes')
          .getPublicUrl(storagePath);
        if (publicData?.publicUrl) {
          directUrl = publicData.publicUrl;
        }
      }
    } catch {
      // Ignora erro de storage e faz fallback
    }
  }

  // 2. Se storage não estiver disponível ou falhar, converter para Base64
  if (!directUrl) {
    base64Data = await fileToBase64OrCompressed(file);
  }

  // 3. Montar o registro do comprovante
  const receiptRecord: ReceiptData = {
    id: receiptId,
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    fileUrl: directUrl,
    base64Data,
    customerName: metadata.customerName,
    customerCity: metadata.customerCity,
    totalCents: metadata.totalCents,
    createdAt: new Date().toISOString(),
  };

  // 4. Salvar registro no Supabase store_settings (acessível de qualquer lugar)
  if (supabase) {
    try {
      await supabase.from('store_settings').upsert({
        key: `receipt_${receiptId}`,
        value: JSON.stringify(receiptRecord),
      });
    } catch (err) {
      console.warn('Erro ao salvar registro de comprovante:', err);
    }
  }

  // Backup no localStorage local
  try {
    localStorage.setItem(`receipt_${receiptId}`, JSON.stringify(receiptRecord));
  } catch {
    // quota exceeded, ignore
  }

  const origin = window.location.origin;
  const viewerUrl = `${origin}/comprovante?id=${receiptId}`;

  return {
    receiptId,
    viewerUrl,
    directUrl,
  };
}

/**
 * Busca um comprovante por ID (no Supabase ou no localStorage local)
 */
export async function getReceipt(receiptId: string): Promise<ReceiptData | null> {
  // 1. Tenta carregar do Supabase
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('store_settings')
        .select('value')
        .eq('key', `receipt_${receiptId}`)
        .single();

      if (!error && data?.value) {
        return JSON.parse(data.value) as ReceiptData;
      }
    } catch (e) {
      console.warn('Erro ao carregar comprovante do Supabase:', e);
    }
  }

  // 2. Fallback para localStorage
  try {
    const local = localStorage.getItem(`receipt_${receiptId}`);
    if (local) {
      return JSON.parse(local) as ReceiptData;
    }
  } catch {
    // ignore
  }

  return null;
}

/**
 * Lista todos os comprovantes salvos no Supabase
 */
export async function listReceipts(): Promise<ReceiptData[]> {
  const receipts: ReceiptData[] = [];

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('store_settings')
        .select('key, value')
        .like('key', 'receipt_%')
        .order('updated_at', { ascending: false });

      if (!error && data) {
        data.forEach((row) => {
          try {
            const parsed = JSON.parse(row.value) as ReceiptData;
            receipts.push(parsed);
          } catch {
            // ignore parse error
          }
        });
      }
    } catch (e) {
      console.warn('Erro ao listar comprovantes:', e);
    }
  }

  return receipts;
}
