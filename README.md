# EasyFinance 💰

> Aplicación web de gestión financiera personal desarrollada con Spring Boot

EasyFinance es una aplicación web de gestión financiera personal desarrollada como Proyecto de Fin de Ciclo de DAW (Desarrollo de Aplicaciones Web). Permite a usuarios registrar ingresos y gastos, visualizar estadísticas mediante gráficos, definir metas de ahorro y monitorizar su progreso, con un panel de administración para gestionar usuarios y categorías globales.

---

## 🚀 DESPLIEGUE RÁPIDO **(Recomendado)**

```bash
git clone git@github.com:HectorSantanaC/EasyFinance.git
cd EasyFinance
```

# 1. MySQL: CREATE DATABASE easyfinance_db
# 2. application.properties → TU usuario/pass
# 3. Bootstrap/Chart.js YA incluidos

```bash
mvn clean package
java -jar target/*.jar
```

http://localhost:8080 → Listo.

---

## 📋 Características Principales

### Gestión de Movimientos
- ✅ CRUD ingresos/gastos
- ✅ Filtros por fecha, categoría y tipo de movimiento

### Dashboard y Visualización
- 📊 Resumen mensual de ingresos, gastos y saldo disponible
- 📈 Gráficos interactivos por categoría (Chart.js)
- 📅 Estadísticas y comparativas

### Metas de Ahorro
- 🎯 CRUD metas personalizadas
- 📊 Progreso visual

### Gestión de Usuario
- 👤 Perfil + cambio contraseña
- 🔒 **Spring Security** (BCrypt/CSRF)

### Panel Administrativo
- 👥 Gestión de usuarios (sin acceso a datos financieros)
- 🏷️ Administración de categorías globales

---

## 🛠️ Tecnologías Utilizadas

### Backend
| Tecnología | Detalles |
|------------|----------|
| **Spring Boot** | 3.x (MVC/Tomcat)[file:1] |
| **Java** | 17+ |
| **Spring Security** | Roles USER/ADMIN |
| **JPA/Hibernate** | ORM MySQL |
| **Maven** | Dependencias |

### Frontend
| Tecnología | Detalles |
|------------|----------|
| **HTML5/CSS3/JS** | Vanilla + Thymeleaf[file:1] |
| **Bootstrap** | 5.3 (CSS/JS/Icons) |
| **Chart.js** | 4.5 (gráficos UMD) |
| **Bootstrap Icons** | 1.12 (fonts) |
| **Thymeleaf**| Plantillas servidor |

### Base de Datos
- **MySQL 8.x**: Esquema relacional (USUARIO, MOVIMIENTO, CATEGORIA, META_AHORRO, ROL)

### Herramientas
- Git/GitHub, Spring Tools Suite, MySQL Workbench[file:1]

---

## 📦 Requisitos Previos

Antes de ejecutar el proyecto, asegúrate de tener instalado:

- ☕ **JDK 17** o superior
- 📦 **Maven 3.8+**
- 🗄️ **MySQL 8.4+**
- 🔧 **Git**
- 💻 **IDE**: IntelliJ IDEA, Eclipse (Spring Tools) o VS Code (con extensiones Java)

---

## 🚀 Instalación y Puesta en Marcha

### 1. Clonar el Repositorio

```bash
git clone git@github.com:HectorSantanaC/EasyFinance.git
cd EasyFinance
```

### 2. Configurar Base de Datos MySQL
Inicia MySQL (puerto 3306).

Crea esquema:
```bash
CREATE DATABASE easyfinance_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Configurar application.properties

# ← CAMBIA TUS DATOS MYSQL
spring.datasource.url=jdbc:mysql://localhost:3306/easyfinance?useSSL=false&serverTimezone=UTC
spring.datasource.username=root     # TU USUARIO
spring.datasource.password=         # TU PASS
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
server.port=8080
spring.thymeleaf.cache=false

### 4. 🚨 Bootstrap + Chart.js + Icons

```bash
npm install
npm run copy-libs
```

Verifica: static/libs/bootstrap/, bootstrap-icons/, chart.js/

### 5. Compilar y Ejecutar

```bash
mvn clean spring-boot:run
```
URL: http://localhost:8080

### 6. Probar

/register → Cuenta

Login → /dashboard (gráficos)

Admin → /admin

### ⚠️ Errores Comunes

**Error**                     **Solución**
Sin gráficos/estilos	        npm run copy-libs
Puerto 8080	                  server.port=8081
MySQL denied	                Credenciales properties
Sin Node	                    Instala Node.js 20+

### 📁 Estructura

EasyFinance/
├── pom.xml                          # Maven dependencias
├── mvnw / mvnw.cmd                  # Maven wrapper
├── docs
│   ├── Plan de proyecto PDF
│   ├── Documento de alcance PDF
│   ├── Diagrama de casos de uso PDF
│   ├── Diagrama ER PDF
│   ├── Diseño Técnico PDF
│   └── Documento de despligue PDF
│ 
├── frontend
│   ├── copy-libs.js
│   └── package.json
│ 
└── src/
    ├── main/
    │   ├── java/es/easyfinance/
    │   │   ├── EasyFinanceApplication.java  # @SpringBootApplication
    │   │   ├── config/
    │   │   │   ├──LoginSuccesHandler.java
    │   │   │   └── SecurityConfig.java      # Spring Security
    │   │   ├── controllers/
    │   │   │   ├── CategoryController.java
    │   │   │   ├── DashboarController.java
    │   │   │   ├── MainController.java
    │   │   │   ├── UserController.java
    │   │   │   ├── TransactionController.java
    │   │   │   ├── SavingsGoalController.java
    │   │   │   └── RolController.java
    │   │   ├── models/
    │   │   │   ├── CategoryModel.java
    │   │   │   ├── RolModel.java
    │   │   │   ├── SavingsGoalModel.java
    │   │   │   ├── TransactionFilterModel.java
    │   │   │   ├── TransactionModel.java
    │   │   │   ├── TransactionTypeModel.java
    │   │   │   └── UserModel.java
    │   │   ├── repositories/
    │   │   │   ├── CategoryRepository.java
    │   │   │   ├── DashboarRepository.java
    │   │   │   ├── UserRepository.java
    │   │   │   ├── TransactionRepository.java
    │   │   │   ├── SavingsGoalRepository.java
    │   │   │   └── RolRepository.java
    │   │   └── services/
    │   │   │   ├── CategoryService.java
    │   │   │   ├── DashboarService.java
    │   │   │   ├── UserService.java
    │   │   │   ├── TransactionService.java
    │   │   │   ├── SavingsGoalService.java
    │   │   │   └── RolService.java
    │   │
    │   └── resources/
    │       ├── application.properties     # DB config
    │       ├── db/
    │       │   └── easyfinance_db.sql
    │       ├── static/
    │       │   │   └── assets/imgages
    │       │   ├── js/
    │       │   │   ├── admin-categories.js
    │       │   │   ├── common.js
    │       │   │   ├── dashboard.js
    │       │   │   ├── login.js
    │       │   │   ├── register.js
    │       │   │   ├── savings.js
    │       │   │   └── transactions.js
    │       │   └── libs/
    │       │       ├── bootstrap
    │       │       ├── chart.js
    │       │       └── bootstrap-icons/
    │       └── templates/                 # Thymeleaf
    │           ├── admin-categories.html
    │           ├── admin-users.html
    │           ├── categories.html
    │           ├── contact.html
    │           ├── dashboard.html
    │           ├── help.html
    │           ├── index.html
    │           ├── login.html
    │           ├── privacy.html
    │           ├── register.html
    │           ├── savings.html
    │           ├── terms.html
    │           └── transactions.html
    │
    └── test/                            # Tests JUnit
        └── java/es/easyfinance/
            └── EasyFinanceApplicationTests.java

---

Héctor Santana - DAW PRW 2025/2026
MIT License
