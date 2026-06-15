# 📚 Arquitectura y Comparación Java/Spring Boot vs Node.js/TypeScript

## Para Desarrolladores Java/Spring Boot

Este documento te ayudará a entender la estructura del proyecto comparándola con conceptos de Spring Boot que ya conocés.

## 🏗️ Estructura por Capas (Similar a Spring Boot)

```
Backend (Como un proyecto Spring Boot)
│
├── Controllers/        → @RestController en Spring
│   ├── matchController.ts
│   ├── predictionController.ts
│   └── userController.ts
│
├── Services/          → @Service en Spring
│   ├── FootballApiService.ts
│   ├── ScoringService.ts
│   └── PredictionService.ts
│
├── Routes/            → @RequestMapping en Spring
│   ├── matchRoutes.ts
│   ├── predictionRoutes.ts
│   └── userRoutes.ts
│
├── Config/            → @Configuration en Spring
│   ├── adminAuth.ts (Middleware)
│   └── socket.ts (WebSocket config)
│
└── Prisma/           → JPA/Hibernate
    ├── schema.prisma  → @Entity classes
    └── seed.ts        → data.sql
```

## 🔄 Equivalencias de Conceptos

### 1. Dependency Injection

**Spring Boot:**
```java
@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
}
```

**Node.js/TypeScript:**
```typescript
export class UserService {
    private prisma: PrismaClient;
    
    constructor() {
        this.prisma = new PrismaClient(); // Manual DI
    }
}
```

**Diferencia:** En Node.js no hay un container de DI automático como Spring. Creás las instancias manualmente o usás bibliotecas como `tsyringe` o `inversify`.

---

### 2. REST Controllers

**Spring Boot:**
```java
@RestController
@RequestMapping("/api/users")
public class UserController {
    
    @GetMapping
    public ResponseEntity<List<User>> getUsers() {
        return ResponseEntity.ok(users);
    }
    
    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        return ResponseEntity.ok(savedUser);
    }
}
```

**Node.js/TypeScript:**
```typescript
// Controller
export const getUsers = async (req: Request, res: Response) => {
    const users = await prisma.user.findMany();
    res.json({ success: true, data: users });
};

// Route
const router = Router();
router.get('/users', getUsers);
router.post('/users', createUser);
```

**Diferencia:** En Express separás el **handler** (controller) de la **ruta** (route). Spring lo unifica con anotaciones.

---

### 3. Entidades y ORM

**Spring Boot (JPA/Hibernate):**
```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true)
    private String name;
    
    @OneToMany(mappedBy = "user")
    private List<Prediction> predictions;
}
```

**Node.js/TypeScript (Prisma):**
```prisma
model User {
  id          Int          @id @default(autoincrement())
  name        String       @unique
  predictions Prediction[]
  
  @@map("users")
}
```

**Diferencia:** Prisma usa un lenguaje de schema propio (DSL) en lugar de anotaciones Java. Es más declarativo y genera el cliente automáticamente.

---

### 4. Repositorios y Queries

**Spring Boot:**
```java
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByName(String name);
    
    @Query("SELECT u FROM User u WHERE u.points > :minPoints")
    List<User> findTopUsers(@Param("minPoints") int minPoints);
}
```

**Node.js/TypeScript (Prisma):**
```typescript
// No necesitás crear interfaces, Prisma Client lo hace automáticamente
const user = await prisma.user.findUnique({
    where: { name: 'Juan' }
});

const topUsers = await prisma.user.findMany({
    where: { 
        predictions: {
            some: { points: { gt: 10 } }
        }
    },
    orderBy: { name: 'asc' }
});
```

**Diferencia:** Prisma genera el cliente con métodos type-safe. No necesitás escribir interfaces ni queries manuales (excepto SQL raw si querés).

---

### 5. DTOs y Validación

**Spring Boot:**
```java
public class CreatePredictionDTO {
    @NotNull
    private Long userId;
    
    @NotNull
    private Long matchId;
    
    @Min(0)
    private int predictedHomeScore;
}
```

**Node.js/TypeScript:**
```typescript
// Definir tipo/interface
interface CreatePredictionDto {
    userId: number;
    matchId: number;
    predictedHomeScore: number;
    predictedAwayScore: number;
}

// Validación manual o con librerías como class-validator
if (!userId || predictedHomeScore < 0) {
    throw new Error('Datos inválidos');
}
```

**Diferencia:** TypeScript solo valida en **tiempo de compilación**. Para validación en runtime necesitás hacerla manualmente o usar `class-validator`, `zod`, `joi`.

---

### 6. Manejo de Errores

**Spring Boot:**
```java
@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(Exception ex) {
        return ResponseEntity.status(404).body(new ErrorResponse(ex.getMessage()));
    }
}
```

**Node.js/TypeScript:**
```typescript
// Middleware global de errores
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: err.message
    });
});
```

**Diferencia:** En Express usás un middleware de errores. En Spring usás `@ControllerAdvice`.

---

### 7. Configuración de Propiedades

**Spring Boot:**
```properties
# application.properties
server.port=8080
spring.datasource.url=jdbc:mysql://localhost:3306/prode
api.football.key=your_key
```

```java
@Value("${api.football.key}")
private String apiKey;
```

**Node.js/TypeScript:**
```bash
# .env
PORT=3001
DATABASE_URL=file:./dev.db
API_FOOTBALL_KEY=your_key
```

```typescript
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.API_FOOTBALL_KEY;
```

**Diferencia:** En Node.js usás `dotenv` para cargar variables de entorno. Spring lo hace automáticamente con `application.properties`.

---

### 8. Testing

**Spring Boot:**
```java
@SpringBootTest
@AutoConfigureMockMvc
public class UserControllerTest {
    @Autowired
    private MockMvc mockMvc;
    
    @Test
    public void testGetUsers() throws Exception {
        mockMvc.perform(get("/api/users"))
               .andExpect(status().isOk());
    }
}
```

**Node.js/TypeScript:**
```typescript
import request from 'supertest';
import app from '../src/index';

describe('GET /api/users', () => {
    it('should return users', async () => {
        const res = await request(app).get('/api/users');
        expect(res.status).toBe(200);
        expect(res.body.data).toBeInstanceOf(Array);
    });
});
```

**Diferencia:** En Node.js usás `jest` + `supertest` para testing. Spring tiene `@SpringBootTest` más integrado.

---

## 🎯 Ventajas y Desventajas

### Node.js/TypeScript

**✅ Ventajas:**
- Más liviano y rápido de arrancar
- Perfecto para APIs REST y real-time (WebSockets)
- Mismo lenguaje en frontend y backend (JavaScript/TypeScript)
- NPM tiene millones de paquetes
- Ideal para microservicios

**❌ Desventajas:**
- No tiene DI automático (Container IoC)
- Menos "mágico" que Spring (más código manual)
- TypeScript solo valida en compile-time
- Menos maduro para aplicaciones empresariales grandes

### Spring Boot

**✅ Ventajas:**
- Ecosystem más maduro y robusto
- DI automático muy potente
- Validación integrada con Bean Validation
- Mejor para aplicaciones monolíticas grandes
- Fuertemente tipado en runtime

**❌ Desventajas:**
- Más pesado (consume más memoria)
- Startup time más lento
- Curva de aprendizaje más empinada
- Menos flexible que Node.js

---

## 📦 Paquetes y sus Equivalentes

| Spring Boot | Node.js/TypeScript |
|-------------|-------------------|
| Spring Web | Express |
| Spring Data JPA | Prisma / TypeORM |
| Spring Security | Passport.js / JWT |
| Lombok | TypeScript interfaces |
| Jackson | Built-in JSON support |
| Spring WebSocket | Socket.IO |
| RestTemplate | Axios |
| Spring Validation | class-validator / zod |
| Logback | Winston / Pino |
| JUnit | Jest / Mocha |

---

## 🔧 Workflows Comparados

### Crear un nuevo endpoint

**Spring Boot:**
1. Crear entity con `@Entity`
2. Crear repository con `extends JpaRepository`
3. Crear service con `@Service`
4. Crear controller con `@RestController`
5. Anotar método con `@GetMapping`

**Node.js/TypeScript:**
1. Definir model en `schema.prisma`
2. Ejecutar `npx prisma generate`
3. Crear service con `class XxxService`
4. Crear controller function `export const getXxx`
5. Registrar ruta en router: `router.get('/xxx', getXxx)`

---

## 💡 Tips para Desarrolladores Java

1. **No busques magia:** Node.js es más explícito. Si necesitás algo, lo importás y lo usás.

2. **Async/Await = CompletableFuture:** En vez de usar callbacks, Node.js moderno usa async/await (como `.thenApply()` en Java)

3. **Middleware = Interceptors:** Los middleware de Express son como los Interceptors de Spring.

4. **Prisma ≠ Hibernate:** Prisma es mucho más simple que Hibernate, pero menos potente en features avanzadas.

5. **TypeScript ayuda mucho:** Sin TypeScript, JavaScript puede ser un caos. TypeScript te da la seguridad de tipos que esperás de Java.

6. **npm = Maven/Gradle:** `package.json` es como `pom.xml` o `build.gradle`

---

## 🚀 Siguiente Paso

Explorá el código del proyecto:
1. Empezá por `backend/src/index.ts` (el main)
2. Seguí por los controllers
3. Después los services
4. Finalmente el schema de Prisma

¡Vas a ver que no es tan diferente a Spring Boot! 🎉

