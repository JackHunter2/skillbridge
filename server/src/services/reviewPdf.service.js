import PDFDocument from 'pdfkit';

const NAVY = '#0b1f3a';
const BIRU = '#1e6fd9';
const HIJAU = '#12a37f';
const AMBER = '#f59e0b';
const MERAH = '#ef4444';
const ABU = '#64748b';
const GARIS = '#e2e8f0';
const TEKS = '#1e293b';

// Font bawaan PDF hanya mendukung karakter Latin, jadi simbol lain diganti yang setara
const bersih = (t) =>
    String(t ?? '')
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[\u2013\u2014]/g, '-')
        .replace(/\u2192/g, '->')
        .replace(/\u2026/g, '...')
        .replace(/[\u2022\u25CF]/g, '-')
        .replace(/[^\x09\x0A\x0D\x20-\x7E\u00A0-\u00FF]/g, '');

const warnaSkor = (n) => (n >= 75 ? HIJAU : n >= 50 ? AMBER : MERAH);
const labelNilai = (n) => (n >= 75 ? 'Kuat' : n >= 50 ? 'Cukup' : 'Perlu diperbaiki');

export function buatLaporanPdf({ review, scores, suggestions, gaps, roadmap }) {
    const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        bufferPages: true,
        info: { Title: `Laporan Reviu - ${bersih(review.title)}`, Author: 'SkillBridge' },
    });

    const M = 50;
    const W = doc.page.width;
    const lebar = W - M * 2;
    const skor = Number(review.overall_score);
    const batas = () => doc.page.height - 65;
    const ruang = (h) => {
        if (doc.y + h > batas()) doc.addPage();
    };

    const judulBagian = (teks) => {
        ruang(60);
        doc.moveDown(0.8);
        doc.font('Helvetica-Bold').fontSize(14).fillColor(NAVY).text(teks, M, doc.y);
        const y = doc.y + 3;
        doc.moveTo(M, y).lineTo(M + lebar, y).lineWidth(1).strokeColor(GARIS).stroke();
        doc.y = y + 10;
    };

    // ---------- Header ----------
    doc.rect(0, 0, W, 118).fill(NAVY);
    doc.font('Helvetica-Bold').fontSize(18).fillColor('#ffffff').text('SkillBridge', M, 30, { lineBreak: false });
    doc.font('Helvetica').fontSize(10).fillColor('#b8c4d6').text('Laporan Reviu Portofolio', M, 54, { lineBreak: false });
    doc.font('Helvetica-Bold').fontSize(15).fillColor('#ffffff')
        .text(bersih(review.title), M, 76, { width: lebar - 110, height: 34, ellipsis: true });

    const cx = W - M - 42;
    const cy = 59;
    doc.circle(cx, cy, 38).fill('#16335c');
    doc.circle(cx, cy, 38).lineWidth(4).strokeColor(warnaSkor(skor)).stroke();
    doc.font('Helvetica-Bold').fontSize(26).fillColor('#ffffff')
        .text(String(Math.round(skor)), cx - 36, cy - 17, { width: 72, align: 'center', lineBreak: false });
    doc.font('Helvetica').fontSize(8).fillColor('#b8c4d6')
        .text('dari 100', cx - 36, cy + 14, { width: 72, align: 'center', lineBreak: false });

    // ---------- Info ----------
    const tanggal = new Date(review.created_at).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric',
    });
    const info = [
        ['Nama', review.full_name],
        ['Status', review.user_type === 'anak_magang' ? 'Anak magang' : 'Fresh graduate'],
        ['Peran target', review.role_name],
        ['Tanggal reviu', tanggal],
    ];
    info.forEach(([k, v], i) => {
        const x = M + (i % 2) * (lebar / 2);
        const y = 136 + Math.floor(i / 2) * 32;
        doc.font('Helvetica').fontSize(8.5).fillColor(ABU).text(k.toUpperCase(), x, y, { lineBreak: false });
        doc.font('Helvetica-Bold').fontSize(11).fillColor(TEKS)
            .text(bersih(v), x, y + 12, { width: lebar / 2 - 10, lineBreak: false, ellipsis: true });
    });
    doc.y = 206;

    // ---------- Ringkasan ----------
    judulBagian(`Ringkasan - ${labelNilai(skor)}`);
    doc.font('Helvetica').fontSize(10.5).fillColor(TEKS).text(bersih(review.summary), M, doc.y, { width: lebar, lineGap: 3 });

    // ---------- Skor per aspek ----------
    judulBagian('Skor per aspek');
    const totalBobot = scores.reduce((a, s) => a + Number(s.weight || 0), 0);
    scores.forEach((s) => {
        doc.font('Helvetica').fontSize(9);
        const hPenjelasan = doc.heightOfString(bersih(s.explanation), { width: lebar });
        ruang(34 + hPenjelasan);

        const y = doc.y;
        const persen = s.weight != null && totalBobot > 0 ? `  (bobot ${Math.round((Number(s.weight) / totalBobot) * 100)}%)` : '';
        doc.font('Helvetica-Bold').fontSize(10.5).fillColor(TEKS)
            .text(`${bersih(s.criteria_name)}${persen}`, M, y, { width: lebar - 50, lineBreak: false });
        doc.text(String(Math.round(s.score)), M + lebar - 40, y, { width: 40, align: 'right', lineBreak: false });

        const by = y + 17;
        doc.roundedRect(M, by, lebar, 6, 3).fill('#e2e8f0');
        doc.roundedRect(M, by, Math.max(6, (lebar * s.score) / 100), 6, 3).fill(warnaSkor(s.score));

        doc.font('Helvetica').fontSize(9).fillColor(ABU).text(bersih(s.explanation), M, by + 12, { width: lebar });
        doc.moveDown(0.7);
    });

    // ---------- Saran ----------
    judulBagian('Saran perbaikan');
    const boxW = (lebar - 10) / 2;
    suggestions.forEach((s) => {
        doc.font('Helvetica').fontSize(10);
        const hSaran = doc.heightOfString(bersih(s.suggestion), { width: lebar });
        ruang(26 + hSaran);

        const y = doc.y;
        const warnaP = { tinggi: MERAH, sedang: AMBER, rendah: ABU }[s.priority] || ABU;
        const labelP = `PRIORITAS ${String(s.priority).toUpperCase()}`;
        doc.font('Helvetica-Bold').fontSize(7.5);
        const tw = doc.widthOfString(labelP) + 14;
        doc.roundedRect(M, y, tw, 14, 7).fill(warnaP);
        doc.fillColor('#ffffff').text(labelP, M + 7, y + 3.5, { lineBreak: false });

        const ket = [s.criteria_name, s.section_ref].filter(Boolean).map(bersih).join('  -  ');
        if (ket) {
            doc.font('Helvetica').fontSize(8.5).fillColor(ABU)
                .text(ket, M + tw + 8, y + 3.5, { width: lebar - tw - 8, lineBreak: false, ellipsis: true });
        }

        doc.font('Helvetica').fontSize(10).fillColor(TEKS).text(bersih(s.suggestion), M, y + 20, { width: lebar });

        if (s.example_before || s.example_after) {
            doc.font('Helvetica').fontSize(9);
            const hB = s.example_before ? doc.heightOfString(bersih(s.example_before), { width: boxW - 16 }) : 0;
            const hA = s.example_after ? doc.heightOfString(bersih(s.example_after), { width: boxW - 16 }) : 0;
            const h = Math.max(hB, hA) + 26;
            doc.y += 6;
            ruang(h + 4);
            const by = doc.y;

            if (s.example_before) {
                doc.roundedRect(M, by, boxW, h, 5).fill('#fef2f2');
                doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#b91c1c').text('SEBELUM', M + 8, by + 7, { lineBreak: false });
                doc.font('Helvetica').fontSize(9).fillColor(TEKS).text(bersih(s.example_before), M + 8, by + 19, { width: boxW - 16 });
            }
            if (s.example_after) {
                const ax = M + boxW + 10;
                doc.roundedRect(ax, by, boxW, h, 5).fill('#ecfdf5');
                doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#047857').text('SESUDAH', ax + 8, by + 7, { lineBreak: false });
                doc.font('Helvetica').fontSize(9).fillColor(TEKS).text(bersih(s.example_after), ax + 8, by + 19, { width: boxW - 16 });
            }
            doc.y = by + h;
        }
        doc.moveDown(1);
    });

    // ---------- Skill gap ----------
    judulBagian(`Skill gap - ${bersih(review.role_name)}`);
    gaps.forEach((g) => {
        ruang(44);
        const y = doc.y;
        const kurang = g.gap_size > 0;
        doc.font('Helvetica-Bold').fontSize(10).fillColor(TEKS)
            .text(bersih(g.skill_name), M, y, { width: lebar - 110, lineBreak: false });
        doc.font('Helvetica-Bold').fontSize(9).fillColor(kurang ? MERAH : HIJAU)
            .text(kurang ? `Kurang ${g.gap_size} level` : 'Memenuhi', M + lebar - 110, y, { width: 110, align: 'right', lineBreak: false });

        const by = y + 18;
        doc.roundedRect(M, by, lebar, 7, 3.5).fill('#e2e8f0');
        if (g.current_level > 0) doc.roundedRect(M, by, (lebar * g.current_level) / 5, 7, 3.5).fill(BIRU);
        const mx = M + (lebar * g.required_level) / 5;
        doc.moveTo(mx, by - 3).lineTo(mx, by + 10).lineWidth(1.5).strokeColor(NAVY).stroke();

        doc.font('Helvetica').fontSize(8.5).fillColor(ABU)
            .text(`Level Anda ${g.current_level}, dibutuhkan ${g.required_level} (skala 0-5)`, M, by + 13, { lineBreak: false });
        doc.y = by + 30;
    });
    doc.font('Helvetica').fontSize(8).fillColor(ABU)
        .text('Garis gelap menandai level yang dibutuhkan peran target.', M, doc.y, { width: lebar });

    // ---------- Roadmap ----------
    judulBagian('Roadmap belajar 30 hari');
    const selesai = roadmap.filter((r) => r.status === 'selesai').length;
    doc.font('Helvetica').fontSize(9.5).fillColor(ABU)
        .text(`Progres: ${selesai} dari ${roadmap.length} langkah selesai`, M, doc.y, { width: lebar });
    doc.moveDown(0.6);

    const minggu = [...new Set(roadmap.map((r) => r.week_no))];
    minggu.forEach((w) => {
        ruang(50);
        doc.font('Helvetica-Bold').fontSize(9).fillColor(BIRU).text(`MINGGU ${w}`, M, doc.y, { width: lebar });
        doc.moveDown(0.3);

        roadmap.filter((r) => r.week_no === w).forEach((r) => {
            doc.font('Helvetica').fontSize(10);
            const h = doc.heightOfString(bersih(r.title), { width: lebar - 20 });
            ruang(h + 22);
            const y = doc.y;
            const done = r.status === 'selesai';

            if (done) {
                doc.roundedRect(M, y + 1, 10, 10, 2).fill(HIJAU);
                doc.moveTo(M + 2.5, y + 6).lineTo(M + 4.5, y + 8.5).lineTo(M + 8, y + 3.5)
                    .lineWidth(1.4).strokeColor('#ffffff').stroke();
            } else {
                doc.roundedRect(M, y + 1, 10, 10, 2).lineWidth(1).strokeColor('#94a3b8').stroke();
            }

            doc.font('Helvetica').fontSize(10).fillColor(done ? ABU : TEKS).text(bersih(r.title), M + 18, y, { width: lebar - 18 });
            doc.font('Helvetica').fontSize(8).fillColor('#94a3b8').text(bersih(r.skill_name), M + 18, doc.y, { width: lebar - 18 });
            doc.moveDown(0.5);
        });
        doc.moveDown(0.4);
    });

    // ---------- Footer semua halaman ----------
    const range = doc.bufferedPageRange();
    for (let i = 0; i < range.count; i++) {
        doc.switchToPage(i);
        doc.page.margins.bottom = 0;
        doc.font('Helvetica').fontSize(8).fillColor(ABU)
            .text('SkillBridge - Reviu dibuat oleh AI dan bersifat masukan awal, bukan penilaian final.',
                M, doc.page.height - 38, { width: lebar - 60, lineBreak: false });
        doc.text(`${i + 1} / ${range.count}`, M + lebar - 50, doc.page.height - 38, { width: 50, align: 'right', lineBreak: false });
    }

    doc.end();
    return doc;
}