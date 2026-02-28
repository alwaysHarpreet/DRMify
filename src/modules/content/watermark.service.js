import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "fs";
import path from "path";

export const applyVisibleWatermark = async (pdfBuffer, watermarkText) => {
	const pdfDoc = await PDFDocument.load(pdfBuffer);
	const pages = pdfDoc.getPages();
	const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

	pages.forEach(page => {
		const { width, height } = page.getSize();
		page.drawText(watermarkText, {
			x: 40,
			y: height - 60,
			size: 9,
			font,
			color: rgb(0.6, 0.6, 0.6),
			rotate: undefined
		});
	});

	return await pdfDoc.save();
};

// Simple invisible watermark: append metadata with user info
export const applyInvisibleWatermark = async (pdfBuffer, meta) => {
	const pdfDoc = await PDFDocument.load(pdfBuffer);
	pdfDoc.setTitle(meta.title || "");
	pdfDoc.setSubject(meta.subject || "");
	pdfDoc.setKeywords([meta.userEmail || "", meta.userId || ""]);
	return await pdfDoc.save();
};

export default {
	applyVisibleWatermark,
	applyInvisibleWatermark
};
