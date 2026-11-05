{
  inputs.nixmodules.url = "github:replit/nixmodules/580a1801a68db63d8ca9e96c24d28277f41f8097";
  inputs.nixpkgs.follows = "nixmodules/nixpkgs";
  outputs = { nixmodules, nixpkgs, ... }:
    let
      packageNames = [  ];
      getPackage = name:
        builtins.foldl' (set: attribute: builtins.getAttr attribute set)
          nixpkgs.legacyPackages.x86_64-linux
          (builtins.filter builtins.isString (builtins.split "\\." name));
    in {
      packages.x86_64-linux.default = nixmodules.lib.mkToolchain {
        moduleIds = [ "replit" "nodejs-24" ];
        deployment = false;
        packages = builtins.map getPackage packageNames;
      };
    };
}
