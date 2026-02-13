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
public class TransactionModel {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "usuario_id")
	private UserModel usuarioId;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "categoria_id")
	private CategoryModel categoriaId;
	
	@Enumerated(EnumType.STRING)
	private TransactionTypeModel tipo;
	
	@Column(precision = 10, scale = 2)
	private BigDecimal cantidad;
	
	private String descripcion;
	private LocalDate fecha;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "meta_ahorro_id")
	private SavingsGoalModel metaAhorroId;
	
	private Long creadoPor;
	private LocalDateTime fechaCreacion;
	private Long modificadoPor;
	private LocalDateTime fechaModificacion;
	
	public TransactionModel() {
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

	public CategoryModel getCategoriaId() {
		return categoriaId;
	}

	public void setCategoriaId(CategoryModel categoriaId) {
		this.categoriaId = categoriaId;
	}

	public TransactionTypeModel getTipo() {
		return tipo;
	}

	public void setTipo(TransactionTypeModel tipo) {
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

	public SavingsGoalModel getMetaAhorroId() {
		return metaAhorroId;
	}

	public void setMetaAhorroId(SavingsGoalModel metaAhorroId) {
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
