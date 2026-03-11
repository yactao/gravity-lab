const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 4000;
const SANDBOX_DIR = path.join(__dirname, 'sandbox');

// Créer le dossier sandbox s'il n'existe pas
if (!fs.existsSync(SANDBOX_DIR)) {
    fs.mkdirSync(SANDBOX_DIR);
}

// Route Health existante de l'Agent Aïna
app.get('/health', (req, res) => {
    res.json({
        status: "ok",
        time: Date.now() / 1000
    });
});

// Route RAG de test (simulée)
app.post('/api/rag', (req, res) => {
    res.json({
        answer: "Ceci est une réponse simulée par Aïna RAG Entreprise.",
        conversation_id: req.body.conversation_id || uuidv4(),
        model: "Aïna Instant"
    });
});

// NOUVELLE ROUTE : Aïna Software Factory
app.post('/api/dev', async (req, res) => {
    const { question, language, conversation_id } = req.body;
    const convId = conversation_id || uuidv4();

    console.log(`[Aïna Coder] Demande reçue : ${question}`);
    console.log(`[Aïna Coder] Étape 1 : Rercherche RAG dans dev-guidelines-index...`);

    // Simuler le LLM Foundry qui génère un script valide (ou qui plante pour l'exemple)
    console.log(`[Aïna Coder] Étape 2 : Inférence LLM Foundry en cours...`);

    // Gènère une erreur simulée à la 1ere boucle si le mot 'erreur' est dans le prompt
    const shouldFailFirst = question.toLowerCase().includes('erreur');

    // 🛡️ [CISO FIX] Faille RCE (Remote Code Execution) colmatée !
    // Aucune interpolation directe de l'entrée utilisateur (question) dans le code exécuté à distance.
    // Passage de la valeur via une variable d'environnement isolée.
    let generatedCode = `console.log("Exécution du script JIRA export demandée :", process.env.USER_QUESTION || "N/A");\nconsole.log("Success: Export CSV généré avec succès !");\n`;
    let codeFiles = { "index.js": generatedCode };

    // Le dossier spécifique pour cette conversation (Bac à sable Azure)
    const execDir = path.join(SANDBOX_DIR, convId);
    if (!fs.existsSync(execDir)) {
        fs.mkdirSync(execDir);
    }

    try {
        // Écriture du code dans le Bac à Sable local (Simulation de Azure Container)
        fs.writeFileSync(path.join(execDir, "index.js"), shouldFailFirst ? "console.log(variableInconnue);" : generatedCode);
        console.log(`[Aïna Sandbox] Lancement de l'environnement virtuel pour tester le code...`);

        let output = await runSandboxCommand(`node index.js`, execDir, { ...process.env, USER_QUESTION: question });

        console.log(`[Aïna Sandbox] Succès ! Sortie Console : ${output}`);

        // Simuler la création du ZIP et de l'URL SAS Azure
        res.json({
            answer: `J'ai développé et testé ton script en ${language || 'Javascript'}. Les tests sont au vert dans la Sandbox Azure.\n\nSortie Console : ${output}`,
            repo_file_path: `pk/${convId}/code.zip`,
            repo_file_sas: `https://aina-mock.blob.core.windows.net/sandbox/${convId}/code.zip?sv=demo-sas-token`,
            conversation_id: convId,
            model: "Aïna-Coder-Foundry-v1"
        });

    } catch (error) {
        console.error(`[Aïna Sandbox] Erreur du Code : ${error}`);
        console.log(`[Aïna Coder] Renvoi de l'Erreur au LLM Foundry pour correction... (Boucle)`);

        if (shouldFailFirst) {
            console.log(`[Aïna Coder] Le LLM a corrigé l'erreur ! Voici le nouveau code.`);
            fs.writeFileSync(path.join(execDir, "index.js"), generatedCode);
            let finalOutput = await runSandboxCommand(`node index.js`, execDir, { ...process.env, USER_QUESTION: question });

            res.json({
                answer: `Le code généré initialement a rencontré une erreur de compilation dans la Sandbox : \n${error}\n\nJe me suis auto-corrigé. Voici la nouvelle exécution : ${finalOutput}`,
                repo_file_path: `pk/${convId}/code.zip`,
                repo_file_sas: `https://aina-mock.blob.core.windows.net/sandbox/${convId}/code.zip?sv=demo-sas-token`,
                conversation_id: convId,
                model: "Aïna-Coder-Foundry-v1"
            });
        } else {
            res.status(500).json({ error: "Échec critique du développement", stack: error });
        }
    }
});

function runSandboxCommand(cmd, cwd, env) {
    return new Promise((resolve, reject) => {
        exec(cmd, { cwd, env: env || process.env }, (error, stdout, stderr) => {
            if (error) {
                reject(stderr || error.message);
            } else {
                resolve(stdout.trim());
            }
        });
    });
}

app.listen(PORT, () => {
    console.log(`[Aïna Mock] 🚀 Serveur démarré sur http://localhost:${PORT}`);
    console.log(`[Aïna Mock] Routes disponibles :`);
    console.log(`   - GET  /health`);
    console.log(`   - POST /api/rag`);
    console.log(`   - POST /api/dev  (✨ Usine Logicielle Foundry)`);
});
