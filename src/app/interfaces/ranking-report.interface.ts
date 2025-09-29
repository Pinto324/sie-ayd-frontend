// src/app/interfaces/ranking-report.interface.ts

export interface RankingReportItem {
    logo: string;           // URL del logo (si está disponible)
    firstname: string;      // Nombre del contacto principal (lo usaremos como "Nombre de Contacto")
    nit: string;            // NIT del comercio
    address: string;        // Dirección del comercio
    deliveries: number;     // Cantidad de guías / volumen de entregas (Métrica de ranking)
}