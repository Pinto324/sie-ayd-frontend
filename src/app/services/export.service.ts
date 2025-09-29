
import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import * as domtoimage from 'dom-to-image'; 
import { jsPDF } from 'jspdf';


// Importa las librerías necesarias (ej: 'xlsx' para Excel, 'jspdf' para PDF)

@Injectable({ providedIn: 'root' })
export class ExportService {
 // 1. EXPORTACIÓN A EXCEL (.xlsx)
  exportToExcel(data: any[], fileName: string): void {
    if (!data || data.length === 0) return;
    
    // Crear una hoja de cálculo a partir de la matriz de datos
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    
    // Crear el libro de trabajo y añadir la hoja
    const wb: XLSX.WorkBook = { Sheets: { 'data': ws }, SheetNames: ['data'] };
    
    // Escribir el archivo
    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    
    // Guardar el archivo usando FileSaver
    const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(dataBlob, fileName + '.xlsx');
  }

  // 2. EXPORTACIÓN A IMAGEN (.png)
   exportToImage(elementId: string, fileName: string): void {
    const data = document.getElementById(elementId);
    if (!data) {
      console.error(`Elemento con ID #${elementId} no encontrado para la exportación.`);
      return;
    }

    // Se usa 'as any' en domtoimage para resolver el error de tipado de 'toBlob'
    (domtoimage as any).toBlob(data, { 
      bgcolor: 'white',
      quality: 0.95 
    })
    .then((blob: any) => { // Tipado explícito para 'blob'
        if (blob) {
            saveAs(blob, fileName + '.png');
        }
    })
    .catch((error: any) => { // Tipado explícito para 'error'
        console.error('Error al generar la imagen con dom-to-image:', error);
        // Si el error persiste, puede ser un problema de CORS o estilos externos
        alert('Error al exportar a imagen. Verifique la consola para detalles.');
    });
  }

  // 2. EXPORTACIÓN A PDF (.pdf) - Usando dom-to-image + jsPDF
  exportToPdf(elementId: string, fileName: string): void {
    const data = document.getElementById(elementId);
    if (!data) {
      console.error(`Elemento con ID #${elementId} no encontrado para la exportación.`);
      return;
    }

    // Se usa 'as any' en domtoimage para resolver el error de tipado de 'toJpeg'
    (domtoimage as any).toJpeg(data, { 
      bgcolor: 'white',
      quality: 1.0,
      width: data.offsetWidth * 2, 
      height: data.offsetHeight * 2,
      style: {
        transform: 'scale(2)',
        transformOrigin: 'top left',
        width: data.offsetWidth + 'px',
        height: data.offsetHeight + 'px',
      }
    })
    .then((imgData: any) => { // Tipado explícito para 'imgData'
      const pdf = new jsPDF('p', 'mm', 'a4'); 
      
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width; 
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(fileName + '.pdf');
    })
    .catch((error: any) => { // Tipado explícito para 'error'
        console.error('Error al generar el PDF con dom-to-image:', error);
        alert('Error al exportar a PDF. Verifique la consola para detalles.');
    });
  }
}