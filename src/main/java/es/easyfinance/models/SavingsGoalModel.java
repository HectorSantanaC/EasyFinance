package es.easyfinance.models;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "metas_ahorro")
public class SavingsGoalModel {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "usuario_id")
	private UserModel usuarioId;
	
	private String nombre;
	private String descripcion;
	
	@Column(precision = 10, scale = 2)
	private BigDecimal cantidadObjetivo;
	
	@Column(precision = 10, scale = 2)
	private BigDecimal cantidadActual;
	
	private LocalDate fechaInicio;
	private LocalDate fechaObjetivo;
	private boolean completada = false;
	private LocalDateTime fechaCompletada;
	private Long creadoPor;
	private LocalDateTime fechaCreacion;
	private Long modificadoPor;
	private LocalDateTime fechaModificacion;
	
	public SavingsGoalModel() {
		super();
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public UserModel getUsuarioId() {
		return usuarioId;
	}

	public void setUsuarioId(UserModel usuarioId) {
		this.usuarioId = usuarioId;
	}

	public String getNombre() {
		return nombre;
	}

	public void setNombre(String nombre) {
		this.nombre = nombre;
	}

	public String getDescripcion() {
		return descripcion;
	}

	public void setDescripcion(String descripcion) {
		this.descripcion = descripcion;
	}

	public BigDecimal getCantidadObjetivo() {
		return cantidadObjetivo;
	}

	public void setCantidadObjetivo(BigDecimal cantidadObjetivo) {
		this.cantidadObjetivo = cantidadObjetivo;
	}

	public BigDecimal getCantidadActual() {
		return cantidadActual;
	}

	public void setCantidadActual(BigDecimal cantidadActual) {
		this.cantidadActual = cantidadActual;
	}

	public LocalDate getFechaInicio() {
		return fechaInicio;
	}

	public void setFechaInicio(LocalDate fechaInicio) {
		this.fechaInicio = fechaInicio;
	}

	public LocalDate getFechaObjetivo() {
		return fechaObjetivo;
	}

	public void setFechaObjetivo(LocalDate fechaObjetivo) {
		this.fechaObjetivo = fechaObjetivo;
	}

	public boolean isCompletada() {
		return completada;
	}

	public void setCompletada(boolean completada) {
		this.completada = completada;
	}

	public LocalDateTime getFechaCompletada() {
		return fechaCompletada;
	}

	public void setFechaCompletada(LocalDateTime fechaCompletada) {
		this.fechaCompletada = fechaCompletada;
	}

	public Long getCreadoPor() {
		return creadoPor;
	}

	public void setCreadoPor(Long creadoPor) {
		this.creadoPor = creadoPor;
	}

	public LocalDateTime getFechaCreacion() {
		return fechaCreacion;
	}

	public void setFechaCreacion(LocalDateTime fechaCreacion) {
		this.fechaCreacion = fechaCreacion;
	}

	public Long getModificadoPor() {
		return modificadoPor;
	}

	public void setModificadoPor(Long modificadoPor) {
		this.modificadoPor = modificadoPor;
	}

	public LocalDateTime getFechaModificacion() {
		return fechaModificacion;
	}

	public void setFechaModificacion(LocalDateTime fechaModificacion) {
		this.fechaModificacion = fechaModificacion;
	}
	
}
