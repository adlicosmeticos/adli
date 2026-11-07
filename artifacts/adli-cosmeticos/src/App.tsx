import { Route, Switch } from 'wouter';
import Home from '@/pages/home';
import AdminPage from '@/pages/admin';
import PolicyPage from '@/pages/policy';
import CheckoutPage from '@/pages/checkout';
import NotFound from '@/pages/not-found';
import { CartProvider } from '@/lib/cart-context';
import CartDrawer from '@/components/cart-drawer';

export default function App() {
  return (
    <CartProvider>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/pagamento" component={CheckoutPage} />
        <Route path="/checkout" component={CheckoutPage} />
        <Route path="/admin" component={AdminPage} />
        <Route path="/fale-conosco">
          {() => <PolicyPage initialTab="fale-conosco" />}
        </Route>
        <Route path="/politica-de-envio">
          {() => <PolicyPage initialTab="envio" />}
        </Route>
        <Route path="/trocas-e-devolucoes">
          {() => <PolicyPage initialTab="trocas" />}
        </Route>
        <Route path="/termos-e-condicoes">
          {() => <PolicyPage initialTab="termos" />}
        </Route>
        <Route path="/politica-de-privacidade">
          {() => <PolicyPage initialTab="privacidade" />}
        </Route>
        <Route component={NotFound} />
      </Switch>
      <CartDrawer />
    </CartProvider>
  );
}
