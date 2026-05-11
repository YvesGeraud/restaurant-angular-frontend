import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { environment } from '@environments/environment';

describe('AuthService (Servicio de Autenticación)', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería ser creado correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('debería llamar a login y retornar el usuario mapeado', async () => {
    const mockCredentials = { usuario: 'test', contrasena: 'password' };
    const mockResponse = {
      exito: true,
      datos: {
        usuario: {
          id_ct_usuario: 1,
          usuario: 'test',
          nombre_completo: 'Test User',
          id_ct_rol: 1,
          rol: 'Admin',
          permisos: []
        }
      }
    };

    const promise = new Promise<void>((resolve) => {
      service.login(mockCredentials).subscribe((user) => {
        expect(user.usuario).toBe('test');
        expect(user.id).toBe(1);
        resolve();
      });
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);

    await promise;
  });
});
