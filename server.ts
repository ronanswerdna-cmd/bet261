import express from "express";
import path from "path";
import fs from "fs";
import nodemailer from "nodemailer";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON parsing
  app.use(express.json());

  // Setup flat file DB configurations
  const DB_DIR = path.join(process.cwd(), "db_data");
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  const USERS_FILE = path.join(DB_DIR, "users.json");
  const EMAILS_FILE = path.join(DB_DIR, "simulated_emails.json");
  const SMS_FILE = path.join(DB_DIR, "simulated_sms.json");

  // DB helper operations
  const readDb = (filePath: string) => {
    if (!fs.existsSync(filePath)) return [];
    try {
      return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch (e) {
      return [];
    }
  };

  const writeDb = (filePath: string, data: any) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  };

  // Helper dynamic base URL detector
  const getBaseUrl = (req: express.Request) => {
    const host = req.get("host") || "localhost:3000";
    const isHeaderHttps = req.headers["x-forwarded-proto"] === "https";
    const protocol = isHeaderHttps ? "https" : "http";
    return `${protocol}://${host}`;
  };

  // Nodemailer transporter initialization
  const sendEmail = async (to: string, subject: string, htmlContent: string) => {
    try {
      const host = process.env.SMTP_HOST || "smtp.gmail.com";
      const port = parseInt(process.env.SMTP_PORT || "587");
      const user = process.env.SMTP_USER;
      const pass = process.env.SMTP_PASS;

      let sentReal = false;
      if (user && pass) {
        try {
          const transporter = nodemailer.createTransport({
            host,
            port,
            secure: port === 465,
            auth: { user, pass },
          });

          await transporter.sendMail({
            from: `"Bet261 Predictor" <${user}>`,
            to,
            subject,
            html: htmlContent,
          });
          sentReal = true;
          console.log(`[Email] Real email successfully sent to ${to}`);
        } catch (err) {
          console.error(`[Email Error] Failed to send real email through SMTP:`, err);
        }
      }

      // Always log to simulation DB so it can be previewed/validated in AI Studio
      const emails = readDb(EMAILS_FILE);
      const newMail = {
        id: "mail_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
        to,
        subject,
        html: htmlContent,
        sentAt: new Date().toISOString(),
        sentReal,
      };
      emails.unshift(newMail);
      writeDb(EMAILS_FILE, emails);
    } catch (globalEmailErr) {
      console.error("[Email Global Error] Critical failure in sendEmail:", globalEmailErr);
    }
  };

  const sendSmsSimulated = (recipientNumber: string, messageText: string) => {
    try {
      console.log(`[SMS Sent] Destination: ${recipientNumber} | Msg: ${messageText}`);
      const smsLog = readDb(SMS_FILE);
      smsLog.unshift({
        id: "sms_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
        to: recipientNumber,
        text: messageText,
        sentAt: new Date().toISOString(),
      });
      writeDb(SMS_FILE, smsLog);
    } catch (smsErr) {
      console.error("[SMS Global Error] Failed to record simulated SMS:", smsErr);
    }
  };

  // --- API ENDPOINTS ---

  // 1. User Inscription (Registration)
  app.post("/api/register", (req, res) => {
    try {
      const { username, name, email, phone, password } = req.body;

      if (!username || !name || !email || !phone || !password) {
        return res.status(400).json({ error: "Tous les champs sont requis." });
      }

      const normalizedUsername = username.toLowerCase().replace(/\s/g, "");
      const normalizedEmail = email.toLowerCase().trim();

      const users = readDb(USERS_FILE);
      
      // Check if username/email already exists
      const existingUser = users.find((u: any) => u.username === normalizedUsername || u.email === normalizedEmail);
      if (existingUser) {
        return res.status(400).json({ error: "L'utilisateur ou l'adresse email existe déjà." });
      }

      const newUser = {
        id: "usr_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
        username: normalizedUsername,
        name,
        email: normalizedEmail,
        phone,
        password, // stored plain for simplicity of prototype/verification
        status: "pending_payment", // Initial phase post registration
        paymentDetails: null,
        registeredAt: new Date().toISOString(),
      };

      users.push(newUser);
      writeDb(USERS_FILE, users);

      // Trigger automatic simulated SMS to both numbers as requested
      const smsMessage = `[Bet261 App] Nouvelle inscription : ${name} CLI, Tél : ${phone}, Email: ${email}. En attente de choix de formule.`;
      sendSmsSimulated("+261330910425", smsMessage);
      sendSmsSimulated("+261387203022", smsMessage);

      // Trigger rich HTML inscription notification email to 'ronanswerdna@gmail.com'
      const emailSubject = `[Inscription Bet261] Nouvel utilisateur inscrit : ${name}`;
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f4f6f9; color: #333; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid #e1e8ed; }
            .header { background: linear-gradient(135deg, #39b54a, #2c913a); color: #ffffff; padding: 25px; text-align: center; }
            .header h1 { margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 0.5px; }
            .content { padding: 30px; }
            .details-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .details-table td { padding: 12px 10px; border-bottom: 1px solid #f0f2f5; font-size: 14px; }
            .details-table td.label { font-weight: bold; color: #657786; width: 180px; }
            .details-table td.value { color: #14171a; font-weight: 600; }
            .footer { background-color: #f8f9fa; text-align: center; padding: 15px; font-size: 11px; color: #aab8c2; border-top: 1px solid #e1e8ed; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>NOUVELLE INSCRIPTION COMPTE BET261 PREDICT</h1>
            </div>
            <div class="content">
              <p style="margin-top:0; font-size: 15px; line-height: 1.5; color: #4b5563;">
                Bonjour, un nouvel utilisateur vient de s'inscrire sur l'application Bet261 Predict :
              </p>
              
              <table class="details-table">
                <tr>
                  <td class="label">Nom complet</td>
                  <td class="value">${name}</td>
                </tr>
                <tr>
                  <td class="label">Nom d'utilisateur</td>
                  <td class="value">${username}</td>
                </tr>
                <tr>
                  <td class="label">Téléphone</td>
                  <td class="value">${phone}</td>
                </tr>
                <tr>
                  <td class="label">Adresse Email</td>
                  <td class="value">${email}</td>
                </tr>
              </table>

              <p style="font-size: 13px; color: #1e3a8a; font-weight: bold; background-color: #dbeafe; padding: 10px; border-radius: 6px; text-align: center; margin-top:20px;">
                ℹ️ Cet utilisateur est actuellement en attente du choix de formule et de son dépôt Mobile Money pour l'activation.
              </p>
            </div>
            <div class="footer">
              Généré par Bet261 Predictor System • ronanswerdna@gmail.com
            </div>
          </div>
        </body>
        </html>
      `;
      sendEmail("ronanswerdna@gmail.com", emailSubject, emailHtml);

      // Trigger automatic SMS alert notifying of registration & email dispatch
      const alertSmsMessage = `[Bet261 App Alert] Un nouvel utilisateur (${name}, Tél: ${phone}) s'est inscrit! Un email de notification a été envoyé à ronanswerdna@gmail.com.`;
      sendSmsSimulated("+261330910425", alertSmsMessage);
      sendSmsSimulated("+261387203022", alertSmsMessage);

      return res.status(200).json({ 
        success: true, 
        message: "Inscription réussie.",
        user: { id: newUser.id, username: newUser.username, name: newUser.name, email: newUser.email, status: newUser.status }
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // 1.5. User and Admin Connexion (Login)
  app.post("/api/login", (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: "Tous les champs sont requis." });
      }

      // Check special admin logon credentials: Ronan Ra & 17022006
      if (username === "Ronan Ra" && password === "17022006") {
        return res.status(200).json({
          success: true,
          message: "Connexion administrateur réussie.",
          user: {
            id: "admin_ronan",
            username: "Ronan Ra",
            name: "Ronan Ra",
            email: "ronanswerdna@gmail.com",
            status: "admin"
          }
        });
      }

      // Normal user database lookup
      const users = readDb(USERS_FILE);
      const user = users.find(
        (u: any) =>
          u.username === username.toLowerCase().replace(/\s/g, "") &&
          u.password === password
      );

      if (!user) {
        return res.status(400).json({ error: "Identifiant ou mot de passe incorrect." });
      }

      return res.status(200).json({
        success: true,
        message: "Connexion réussie.",
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          phone: user.phone,
          status: user.status,
          paymentDetails: user.paymentDetails
        }
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // 2. Submit Transaction Proof (Mvola or Airtel)
  app.post("/api/submit-payment", async (req, res) => {
    try {
      const { userId, network, senderPhone, transactionRef, planName, price } = req.body;

      if (!userId || !network || !senderPhone || !transactionRef || !planName || !price) {
        return res.status(400).json({ error: "Tous les champs de transaction sont requis." });
      }

      const users = readDb(USERS_FILE);
      const userIndex = users.findIndex((u: any) => u.id === userId);

      if (userIndex === -1) {
        return res.status(404).json({ error: "Utilisateur non trouvé." });
      }

      // Update user details
      const user = users[userIndex];
      user.status = "pending_verification";
      user.paymentDetails = {
        network,
        senderPhone,
        transactionRef,
        planName,
        price,
        submittedAt: new Date().toISOString(),
      };

      users[userIndex] = user;
      writeDb(USERS_FILE, users);

      // Trigger SMS informing about payment submission to both numbers
      const smsMessage = `[Bet261 App] Dépôt reçu ! ${user.name} a soumis ${price} Ar via ${network}. Réf : ${transactionRef}. Vérifier l'email !`;
      sendSmsSimulated("+261330910425", smsMessage);
      sendSmsSimulated("+261387203022", smsMessage);

      // Trigger rich HTML verification email to 'ronanswerdna@gmail.com'
      const baseUrl = getBaseUrl(req);
      const emailSubject = `[Validation Bet261] Transaction Mobile Money de ${user.name}`;
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f4f6f9; color: #333; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid #e1e8ed; }
            .header { background: linear-gradient(135deg, #39b54a, #2c913a); color: #ffffff; padding: 25px; text-align: center; }
            .header h1 { margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 0.5px; }
            .content { padding: 30px; }
            .details-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .details-table td { padding: 12px 10px; border-bottom: 1px solid #f0f2f5; font-size: 14px; }
            .details-table td.label { font-weight: bold; color: #657786; width: 180px; }
            .details-table td.value { color: #14171a; font-weight: 600; }
            .actions-container { display: flex; gap: 15px; margin-top: 35px; justify-content: center; }
            .btn { display: inline-block; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; text-transform: uppercase; text-align: center; color: white !important; }
            .btn-approve { background-color: #39b54a; box-shadow: 0 4px 6px rgba(57,181,74,0.2); }
            .btn-approve:hover { background-color: #2c913a; }
            .btn-reject { background-color: #e0245e; box-shadow: 0 4px 6px rgba(224,36,94,0.2); }
            .btn-reject:hover { background-color: #b81643; }
            .footer { background-color: #f8f9fa; text-align: center; padding: 15px; font-size: 11px; color: #aab8c2; border-top: 1px solid #e1e8ed; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>VALIDATION COMPTE PREMIUM BET261</h1>
            </div>
            <div class="content">
              <p style="margin-top:0; font-size: 15px; line-height: 1.5; color: #4b5563;">
                Bonjour, un client vient d'effectuer un transfert Mobile Money de <strong>${price} Ar</strong> pour activer l'accès VIP :
              </p>
              
              <table class="details-table">
                <tr>
                  <td class="label">Nom complet client</td>
                  <td class="value">${user.name}</td>
                </tr>
                <tr>
                  <td class="label">Téléphone client</td>
                  <td class="value">${user.phone}</td>
                </tr>
                <tr>
                  <td class="label">Adresse Email</td>
                  <td class="value">${user.email}</td>
                </tr>
                <tr>
                  <td class="label">Réseau choisi</td>
                  <td class="value" style="color: ${network === "MVOLA" ? "#fabd00" : "#e31937"}; font-weight: 800;">${network}</td>
                </tr>
                <tr>
                  <td class="label">Formule d'abonnement</td>
                  <td class="value">${planName}</td>
                </tr>
                <tr>
                  <td class="label">Montant de la formule</td>
                  <td class="value" style="color: #39b54a;">${price} Ar</td>
                </tr>
                <tr>
                  <td class="label">Téléphone Expéditeur</td>
                  <td class="value">${senderPhone}</td>
                </tr>
                <tr>
                  <td class="label">Référence Transaction</td>
                  <td class="value" style="font-family: monospace; font-size: 15px; color:#2c913a;">${transactionRef}</td>
                </tr>
              </table>

              <p style="font-size: 13px; color: #f59e0b; font-weight: bold; background-color: #fef3c7; padding: 10px; border-radius: 6px; text-align: center; margin-top:20px;">
                ⚠️ Veuillez valider les coordonnées de paiement de ${user.name} avec votre relevé de compte Mvola/Airtel Money avant d'approuver.
              </p>

              <div class="actions-container">
                <a class="btn btn-approve" href="${baseUrl}/api/admin/verify?userId=${user.id}&action=approve">Approuver & Activer ✅</a>
                <a class="btn btn-reject" href="${baseUrl}/api/admin/verify?userId=${user.id}&action=reject">Rejeter ❌</a>
              </div>
            </div>
            <div class="footer">
              Généré par Bet261 Predictor System • ronanswerdna@gmail.com
            </div>
          </div>
        </body>
        </html>
      `;

      await sendEmail("ronanswerdna@gmail.com", emailSubject, emailHtml);

      // Trigger SMS informing about payment submission to notify owner (+261387203022) in addition to email notification
      const ownerPaymentSms = `[Bet261 App Alert] Un dépôt de ${price} Ar a été soumis par ${user.name} (Réf : ${transactionRef}). Fiche de validation envoyée à votre email: ronanswerdna@gmail.com.`;
      sendSmsSimulated("+261330910425", ownerPaymentSms);
      sendSmsSimulated("+261387203022", ownerPaymentSms);

      return res.status(200).json({ 
        success: true, 
        message: "Détails de paiement envoyés avec succès à l'administrateur Ratsimazafy.",
        status: user.status
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // 3. Simple User Status Poller
  app.get("/api/user-status", (req, res) => {
    try {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({ error: "userId requis." });
      }

      const users = readDb(USERS_FILE);
      const user = users.find((u: any) => u.id === userId);

      if (!user) {
        return res.status(404).json({ error: "Utilisateur introuvable." });
      }

      return res.status(200).json({ 
        userId: user.id,
        status: user.status,
        name: user.name,
        paymentDetails: user.paymentDetails
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // 4. Admin Direct Link Verification Action Handler (Approve / Reject Action triggered from Email)
  app.get("/api/admin/verify", (req, res) => {
    try {
      const { userId, action } = req.query;

      if (!userId || !action) {
        return res.status(400).send("Paramètres userId ou action obligatoires.");
      }

      const users = readDb(USERS_FILE);
      const userIndex = users.findIndex((u: any) => u.id === userId);

      if (userIndex === -1) {
        return res.status(404).send("Utilisateur introuvable.");
      }

      const user = users[userIndex];
      const targetStatus = action === "approve" ? "verified" : "rejected";
      
      user.status = targetStatus;
      users[userIndex] = user;
      writeDb(USERS_FILE, users);

      // Trigger automatic simulated SMS informing verification outcome
      const outcomeMessage = action === "approve" 
        ? `[Bet261 App] Félicitations ${user.name} ! Votre abonnement VIP a été validé avec succès par l'Admin. Votre radar est actif !`
        : `[Bet261 App] Désolé ${user.name}, votre transaction n'a pas pu être validée par l'Admin. Veuillez contacter le support.`;
      
      sendSmsSimulated(user.phone, outcomeMessage);

      // Render highly polished responsive Web success response page
      const title = action === "approve" ? "ABONNEMENT ACTIVÉ AVEC SUCCÈS" : "DEMANDE D'ABONNEMENT REFUSÉE";
      const icon = action === "approve" ? "✅" : "❌";
      const bgAccent = action === "approve" ? "#39b54a" : "#ff1e1e";
      const statusText = action === "approve" 
        ? `L'accès VIP et le radar algorithmique complet ont été activés de suite pour <strong>${user.name}</strong> (${user.phone}). Le client verra s'allumer le statut actif sur son écran.`
        : `La preuve de paiement soumise par le client <strong>${user.name}</strong> a été refusée. Le client recevra une alerte sur son application.`;

      res.setHeader("Content-Type", "text/html");
      return res.send(`
        <!doctype html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Ratsimazafy Admin Verification Dashboard</title>
            <script src="https://cdn.tailwindcss.com"></script>
          </head>
          <body class="bg-gray-950 text-white min-h-screen flex items-center justify-center p-4">
            <div class="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden text-center space-y-6">
              
              <!-- Border top accent -->
              <div class="absolute top-0 left-0 right-0 h-2" style="background-color: ${bgAccent};"></div>
              
              <div class="text-6xl pt-4 animate-bounce">
                ${icon}
              </div>

              <div class="space-y-2">
                <h1 class="text-base font-black tracking-wide uppercase" style="color: ${bgAccent};">
                  ${title}
                </h1>
                <p class="text-xs text-gray-400 font-mono">
                  PROFIL : ${user.username}
                </p>
              </div>

              <p class="text-sm text-gray-200 leading-relaxed text-left bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
                ${statusText}
              </p>

              <div class="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-gray-500">
                Action administrative enregistrée le ${new Date().toLocaleString('fr-FR')} par Ratsimazafy.
              </div>

              <div class="pt-2">
                <p class="text-[10px] text-gray-600">Vous pouvez fermer cet onglet.</p>
              </div>
            </div>
          </body>
        </html>
      `);
    } catch (e: any) {
      return res.status(500).send(`Erreur lors du traitement de l'action: ${e.message}`);
    }
  });

  // 5. Admin Panel APIs for testing inside the application (in preview iframe)
  app.get("/api/admin/system-logs", (req, res) => {
    try {
      const users = readDb(USERS_FILE);
      const emails = readDb(EMAILS_FILE);
      const sms = readDb(SMS_FILE);

      return res.status(200).json({
        users,
        emails,
        sms,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // Action bypass for preview client to mock admin approval instantly
  app.post("/api/admin/action-bypass", (req, res) => {
    try {
      const { userId, action } = req.body;

      if (!userId || !action) {
        return res.status(400).json({ error: "Missing parameters" });
      }

      const users = readDb(USERS_FILE);
      const userIndex = users.findIndex((u: any) => u.id === userId);

      if (userIndex === -1) {
        return res.status(404).json({ error: "User not found" });
      }

      const user = users[userIndex];
      user.status = action === "approve" ? "verified" : "rejected";
      users[userIndex] = user;
      writeDb(USERS_FILE, users);

      // Log simulated SMS
      const outcomeMessage = action === "approve" 
        ? `[Bet261 App] Félicitations ${user.name} ! Votre abonnement VIP a été validé avec succès par l'Admin. Votre radar est actif !`
        : `[Bet261 App] Désolé ${user.name}, votre transaction n'a pas pu être validée par l'Admin. Veuillez contacter le support.`;
      sendSmsSimulated(user.phone, outcomeMessage);

      return res.status(200).json({ success: true, user });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });


  // --- VITE DEV MIDDLEWARE AND STATIC SERVING ----
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
