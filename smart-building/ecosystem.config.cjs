module.exports = {
    apps: [
        {
            name: "gtb-frontend",
            script: "npm",
            args: "run start",
            cwd: "./frontend",
            env: {
                NODE_ENV: "production",
                PORT: "3000",
                // Remplacez par le nom de domaine de production
                NEXT_PUBLIC_API_URL: "http://127.0.0.1:3001"
            },
            watch: false,
            autorestart: true,
            max_memory_restart: "300M"
        },
        {
            name: "gtb-backend",
            script: "node",
            args: "dist/src/main.js",
            cwd: "./backend",
            env: {
                NODE_ENV: "production",
                PORT: "3001",
                DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY || "sk-7922a0832bc3430a9bed41b7399487f9",
                // Pensez à configurer vos credentials Hostinger DB en Prod
                DB_HOST: "localhost",
                DB_PORT: "5432",
                DB_USER: "votre_utilisateur",
                DB_PASS: "votre_mot_de_passe",
                DB_NAME: "votre_base_de_donnees"
            },
            watch: false,
            autorestart: true,
            max_memory_restart: "300M"
        }
    ]
};
