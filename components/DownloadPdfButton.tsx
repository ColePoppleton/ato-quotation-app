"use client";

import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function DownloadPdfButton({ quote }: { quote: any }) {
    const [isGenerating, setIsGenerating] = useState(false);

    const generatePDF = async () => {
        setIsGenerating(true);
        try {
            // 1. Fetch Branding Settings
            const settingsRes = await fetch('/api/settings');
            const settingsData = await settingsRes.json();
            const settings = settingsData.data;

            const hexToRgb = (hex: string) => {
                const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [37, 99, 235];
            };
            const primaryColor = hexToRgb(settings.primaryColor);

            // 2. Convert Logo URL to Base64 safely
            let logoBase64 = null;
            if (settings.logoUrl) {
                try {
                    const img = new Image();
                    img.crossOrigin = "Anonymous";
                    img.src = settings.logoUrl;
                    await new Promise((resolve, reject) => {
                        img.onload = resolve;
                        img.onerror = reject;
                    });
                    const canvas = document.createElement("canvas");
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext("2d");
                    ctx?.drawImage(img, 0, 0);
                    logoBase64 = canvas.toDataURL("image/png");
                } catch (e) {
                    console.warn("Could not load logo for PDF due to CORS or invalid URL.");
                }
            }

            // 3. Initialize Document
            const doc = new jsPDF();

            // 4. Header Bar
            doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
            doc.rect(0, 0, 210, 40, "F");

            // 5. Add Logo OR Text Header
            if (logoBase64) {
                // x: 14, y: 5, width: 40, height: 30 (adjust these dimensions based on your logo aspect ratio)
                doc.addImage(logoBase64, 'PNG', 14, 5, 40, 30, '', 'FAST');
            } else {
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(22);
                doc.setFont("helvetica", "bold");
                doc.text(settings.companyName || "ATO Engine", 14, 25);
            }

            // 6. Quote Details
            doc.setTextColor(50, 50, 50);
            doc.setFontSize(16);
            doc.text("Official Quotation", 14, 55);

            doc.setFontSize(11);
            doc.setFont("helvetica", "normal");
            doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 65);
            doc.text(`Client: ${quote.organisationId?.name || "Corporate Client"}`, 14, 72);
            doc.text(`Course: ${quote.courseInstanceId?.courseId?.title || "Training"}`, 14, 79);
            doc.text(`Delegates: ${quote.delegateCount}`, 14, 86);

            // 7. Financial Table
            autoTable(doc, {
                startY: 100,
                headStyles: { fillColor: primaryColor as any },
                head: [['Description', 'Amount (£)']],
                body: [
                    ['Base Tuition fees', `£${quote.financials.basePrice.toLocaleString()}`],
                    ['Exam Certification Fees', `£${quote.financials.examFees.toLocaleString()}`],
                    ['Trainer Travel (Mileage)', `£${quote.financials.travelCost.toLocaleString()}`],
                    ['Trainer Accommodation', `£${quote.financials.accommodationCost.toLocaleString()}`],
                ],
                footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
                foot: [['Total Financial Investment', `£${quote.financials.totalPrice.toLocaleString()}`]],
            });

            // 8. Footer
            const pageHeight = doc.internal.pageSize.height;
            doc.setFontSize(9);
            doc.setTextColor(150, 150, 150);
            doc.text(settings.companyAddress || "Generated via ATO Engine", 14, pageHeight - 15);

            doc.save(`Quote_${quote.organisationId?.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);

        } catch (err) {
            alert("Failed to generate PDF.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <button onClick={generatePDF} disabled={isGenerating} className="px-4 py-2 bg-blue-50 text-blue-700 font-bold rounded-lg hover:bg-blue-100 transition-colors text-sm disabled:opacity-50">
            {isGenerating ? "Building..." : "⬇ Download PDF"}
        </button>
    );
}