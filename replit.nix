{ pkgs }: {
    deps = [
        pkgs.busybox-sandbox-shell
        pkgs.bashInteractive
        pkgs.nodejs
    ];
}