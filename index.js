const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');

// Render sunucusunun uyanık kalması için web sunucusu
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Sakarya WhatsApp Botu Aktif!'));
app.listen(PORT, () => console.log(`Sunucu ${PORT} portunda dinleniyor.`));

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined
    }
});

client.on('qr', (qr) => {
    console.log('--- AŞAĞIDAKİ QR KODU WHATSAPP ILE OKUTUN ---');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Bot başarıyla bağlandı ve 7/24 dinleme moduna geçti!');
});

client.on('message', async (msg) => {
    try {
        const chat = await msg.getChat();
        
        if (chat.isGroup) {
            // ⚠️ BURAYA DİNLENECEK ANA GRUBUN ADINI TAM OLARAK YAZ
            const kaynakGrupAdi = "TÜM TÜRKİYE NAKLİYE İŞLERİ"; 
            
            // ⚠️ BURAYA MESAJIN ATILACAĞI KENDİ GRUBUNUZUN ADINI YAZ
            const hedefGrupAdi = "SAKARYA NAKLİYE İŞLERİ"; 

            if (chat.name.toLowerCase().includes(kaynakGrupAdi.toLowerCase())) {
                const metin = msg.body.toLowerCase();
                
                // Sakarya ve ilçe anahtar kelimeleri
                const sakaryaKelimeleri = ['sakarya', 'adapazarı', 'serdivan', 'erenler', 'hendek', 'akyazı', 'karasu', 'pamukova', 'geyve', 'sapanca'];
                const sakaryaIsiMi = sakaryaKelimeleri.some(kelime => metin.includes(kelime));

                if (sakaryaIsiMi) {
                    const chats = await client.getChats();
                    const targetChat = chats.find(c => c.name.toLowerCase().includes(hedefGrupAdi.toLowerCase()));
                    
                    if (targetChat) {
                        await targetChat.sendMessage(`📢 *YENİ SAKARYA İŞİ (Otomatik Aktarım)*:\n\n${msg.body}`);
                        console.log('Sakarya işi hedef gruba başarıyla aktarıldı.');
                    } else {
                        console.log('Hedef grup bulunamadı! Lütfen grup adını kontrol edin.');
                    }
                }
            }
        }
    } catch (error) {
        console.error('Mesaj işlenirken hata:', error);
    }
});

client.initialize();