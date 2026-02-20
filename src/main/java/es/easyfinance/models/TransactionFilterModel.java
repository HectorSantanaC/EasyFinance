package es.easyfinance.models;

import java.time.LocalDate;

public class TransactionFilterModel {
	
	private String tipo;
    private String categoria;
    private LocalDate fechaDesde;
    private LocalDate fechaHasta;

    public TransactionFilterModel() {}

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }

    public LocalDate getFechaDesde() { return fechaDesde; }
    public void setFechaDesde(LocalDate fechaDesde) { this.fechaDesde = fechaDesde; }

    public LocalDate getFechaHasta() { return fechaHasta; }
    public void setFechaHasta(LocalDate fechaHasta) { this.fechaHasta = fechaHasta; }

}
