import { db } from '../lib/db.js';

/**
 * Handle submit form pendaftaran lingkungan (Custom Columns & Redirect)
 */
export const registerLingkungan = async (req, res) => {
    // Destructuring req.body sesuai atribut 'name' di form (image_666612.jpg)
    const { 
        program_slug, 
        program_title, 
        fullname, 
        email, 
        whatsapp, 
        alamat, 
        transportasi, 
        pengalaman, 
        ...extraFields 
    } = req.body;
    
    try {
        // Query INSERT INTO dengan nama kolom yang lo minta
        const sql = `INSERT INTO pendaftaran_lingkungan 
            (user_id, program_slug, program_title, nama_kustom, email_kustom, whatsapp_kustom, alamat_domisili, transportasi, pengalaman_relawan, detail_lain) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;  
        const detailLain = JSON.stringify(extraFields);     
        const [result] = await db.query(sql, [
            req.session.user ? req.session.user.id : null, 
            program_slug, 
            program_title, 
            fullname,  // Masuk ke nama_kustom
            email,     // Masuk ke email_kustom
            whatsapp,  // Masuk ke whatsapp_kustom
            alamat || null,
            transportasi || null,
            pengalaman || null,
            detailLain
        ]);

        // Log BERHASIL ke terminal
        console.log(`✅ BERHASIL: Pendaftaran '${fullname}' tersimpan. ID: ${result.insertId}`);

        // Redirect ke halaman terima kasih sesuai permintaan lo
        res.redirect('/lingkungan/terima-kasih');
        
    } catch (err) {
        // Tampilkan error di console.log terminal biar lo bisa baca (sesuai poin 4)
        console.error('❌ GAGAL SIMPAN PENDAFTARAN LINGKUNGAN:');
        console.error('--- DETAIL ERROR ---');
        console.error('Pesan:', err.message);
        console.error('Kode:', err.code);
        console.error('Query:', err.sql);
        console.error('--------------------');
        
        // Render balik ke form dengan pesan error
        res.render('form-lingkungan', {
            user: req.session.user || null,
            program: { slug: program_slug, title: program_title },
            message: '⚠️ Terjadi kesalahan server saat menyimpan data. Cek terminal untuk detailnya.'
        });
    }
};