import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { save } from '@tauri-apps/api/dialog';
import { writeBinaryFile, BaseDirectory } from '@tauri-apps/api/fs';

const PDFMarginModifier: React.FC = () => {
    const [topMargin, setTopMargin] = useState(0);
    const [rightMargin, setRightMargin] = useState(0);
    const [bottomMargin, setBottomMargin] = useState(0);
    const [leftMargin, setLeftMargin] = useState(0);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files?.length) {
            setSelectedFile(event.target.files[0]);
        }
    };

    const addMarginsToPdf = async () => {
        if (!selectedFile) return;

        const originalPdfDoc = await PDFDocument.load(await selectedFile.arrayBuffer());
        // const newPdfDoc = await PDFDocument.create();
        // console.log('Adding margins...', { topMargin, rightMargin, bottomMargin, leftMargin });
        // for (let pageIndex = 0; pageIndex < originalPdfDoc.getPageCount(); pageIndex++) {
        //     const originalPage = originalPdfDoc.getPage(pageIndex);

        //     // Get original page size
        //     const { width, height } = originalPage.getSize();

        //     // Calculate new page size with margins
        //     const newWidth = width + leftMargin + rightMargin;
        //     const newHeight = height + topMargin + bottomMargin;

        //     // Create a new page with adjusted dimensions for margins
        //     const newPage = newPdfDoc.addPage([newWidth, newHeight]);

        //     // Embed the original page content into the new page, offset by the left and top margins
        //     const embeddedPage = await newPdfDoc.embedPage(originalPage);

        //     // Embed the original page content into the new page, offset by the left and top margins
        //     newPage.drawPage(embeddedPage, {
        //         x: leftMargin,
        //         y: newHeight - originalPage.getHeight() - topMargin, // Offset from the bottom of the page
        //     });
        // }

        originalPdfDoc.getPages().forEach(page => {
            const { width, height } = page.getSize();
            // Adjust the page's media box to add margins
            page.setMediaBox(
                0 - leftMargin,
                0 - bottomMargin,
                width + rightMargin,
                height + topMargin
            );
        });

        // Save the modified PDF
        const pdfBytes = await originalPdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });

        // Trigger download of the modified PDF
        // const link = document.createElement('a');
        // link.href = URL.createObjectURL(blob);
        // link.download = 'modified_pdf.pdf';
        // document.body.appendChild(link);
        // link.click();
        // link.remove();

        const savePath = await save({
            filters: [{
                name: 'modified_pdf',
                extensions: ['pdf']
            }]
        });
        if (savePath) {
            // Write the modified PDF to the path
            console.log(savePath)
            writeBinaryFile({ path: savePath, contents: new Uint8Array(pdfBytes) });
        }
    };

    return (
        <div>
            <div>
                <label>Top Margin: </label>
                <input type="number" value={topMargin} onChange={e => setTopMargin(parseInt(e.target.value, 10))} />
            </div>
            <div>
                <label>Right Margin: </label>
                <input type="number" value={rightMargin} onChange={e => setRightMargin(parseInt(e.target.value, 10))} />
            </div>
            <div>
                <label>Bottom Margin: </label>
                <input type="number" value={bottomMargin} onChange={e => setBottomMargin(parseInt(e.target.value, 10))} />
            </div>
            <div>
                <label>Left Margin: </label>
                <input type="number" value={leftMargin} onChange={e => setLeftMargin(parseInt(e.target.value, 10))} />
            </div>
            <div>
                <input type="file" accept="application/pdf" onChange={handleFileChange} />
            </div>
            <button onClick={addMarginsToPdf}>Add Margins and Download PDF</button>
        </div>
    );
};

export default PDFMarginModifier;
