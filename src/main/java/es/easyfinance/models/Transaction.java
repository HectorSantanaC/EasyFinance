package es.easyfinance.models;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "transacciones")
public class Transaction {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "usuario_id")
	private User usuarioId;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "categoria_id")
	private Category categoriaId;
	
	@Enumerated(EnumType.STRING)
	private TransactionType tipo;
	
	@Column(precision = 10, scale = 2)
	private BigDecimal cantidad;
	
	private String descripcion;
	private LocalDate fecha;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "meta_ahorro_id")
	private SavingsGoal metaAhorroId;
	
	private Long creadoPor;
	private LocalDateTime fechaCreacion;
	private Long modificadoPor;
	private LocalDateTime fechaModificacion;
	
	public Transaction() {
		super();
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public User getUsuarioId() {
		return usuarioId;
	}

	public void setUsuarioId(User usuarioId) {
		this.usuarioId = usuarioId;
	}

	public Category getCategoriaId() {
		return categoriaId;
	}

	public void setCategoriaId(Category categoriaId) {
		this.categoriaId = categoriaId;
	}

	public TransactionType getTipo() {
		return tipo;
	}

	public void setTipo(TransactionType tipo) {
		this.tipo = tipo;
	}

	public BigDecimal getCantidad() {
		return cantidad;
	}

	public void setCantidad(BigDecimal cantidad) {
		this.cantidad = cantidad;
	}

	public String getDescripcion() {
		return descripcion;
	}

	public void setDescripcion(String descripcion) {
		this.descripcion = descripcion;
	}

	public LocalDate getFecha() {
		return fecha;
	}

	public void setFecha(LocalDate fecha) {
		this.fecha = fecha;
	}

	public SavingsGoal getMetaAhorroId() {
		return metaAhorroId;
	}

	public void setMetaAhorroId(SavingsGoal metaAhorroId) {
		this.metaAhorroId = metaAhorroId;
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
