# Thompson University — API Endpoints

Backend: **CodeIgniter 3** + **REST_Controller** | Base URL: `http://localhost:9090/api`

---

## Convenciones generales

- IDs son `INT AUTO_INCREMENT`
- Fechas en formato ISO 8601 (`YYYY-MM-DDTHH:mm:ss.sssZ`) o `YYYY-MM-DD`
- Todos los endpoints devuelven JSON
- Errores: HTTP 400/422 con `{ status: "error", message: "..." }`
- Éxito: HTTP 200 con `{ status: "success", data: ... }`
- Paginación: query param `?page=1&limit=15`

### Estructura del controller

```
application/
├── controllers/
│   └── api.php                  # Un solo controller Api
├── models/
│   ├── student_model.php
│   ├── exam_model.php
│   ├── enrollment_model.php
│   ├── grade_model.php
│   └── payment_model.php
└── config/
    └── routes.php               # Rutas CI3
```

### Rutas (`application/config/routes.php`)

```php
$route['api/students/search']['get']       = 'api/students_search';
$route['api/students/(:num)']['get']       = 'api/students_get/$1';
$route['api/students/(:num)']['put']       = 'api/students_update/$1';
$route['api/students/(:num)']['delete']    = 'api/students_delete/$1';
$route['api/students']['get']              = 'api/students_index';
$route['api/students']['post']             = 'api/students_create';

$route['api/exams/scheduled']['get']       = 'api/exams_scheduled';
$route['api/exams/(:num)']['get']          = 'api/exams_get/$1';
$route['api/exams/(:num)']['put']          = 'api/exams_update/$1';
$route['api/exams/(:num)']['delete']       = 'api/exams_delete/$1';
$route['api/exams']['get']                 = 'api/exams_index';
$route['api/exams']['post']                = 'api/exams_create';

$route['api/enrollments/check']['get']     = 'api/enrollments_check';
$route['api/enrollments/(:num)']['get']    = 'api/enrollments_get/$1';
$route['api/enrollments/(:num)']['put']    = 'api/enrollments_update/$1';
$route['api/enrollments/(:num)']['delete'] = 'api/enrollments_delete/$1';
$route['api/enrollments']['get']           = 'api/enrollments_index';
$route['api/enrollments']['post']          = 'api/enrollments_create';

$route['api/grades/(:num)']['get']         = 'api/grades_get/$1';
$route['api/grades/(:num)']['put']         = 'api/grades_update/$1';
$route['api/grades/(:num)']['delete']      = 'api/grades_delete/$1';
$route['api/grades']['get']                = 'api/grades_index';
$route['api/grades']['post']               = 'api/grades_create';

$route['api/payments/summary']['get']      = 'api/payments_summary';
$route['api/payments/(:num)']['get']       = 'api/payments_get/$1';
$route['api/payments/(:num)']['put']       = 'api/payments_update/$1';
$route['api/payments/(:num)']['delete']    = 'api/payments_delete/$1';
$route['api/payments']['get']              = 'api/payments_index';
$route['api/payments']['post']             = 'api/payments_create';

$route['api/reports/passed']['get']        = 'api/reports_passed';
$route['api/reports/failed']['get']        = 'api/reports_failed';
$route['api/reports/pending-payments']['get'] = 'api/reports_pending_payments';
$route['api/reports/all-students']['get']  = 'api/reports_all_students';
$route['api/reports/stats']['get']         = 'api/reports_stats';

$route['api/dashboard']['get']             = 'api/dashboard';
```

---

## 1. Estudiantes (`api/students`)

### Model: Student

```php
// application/models/Student_model.php

class Student_model extends CI_Model {

    protected $table = 'students';

    public function get_all($search = null) {
        $this->db->select('*');
        if ($search) {
            $this->db->group_start();
            $this->db->like('first_name', $search);
            $this->db->or_like('last_name', $search);
            $this->db->or_like('cedula', $search);
            $this->db->group_end();
        }
        $this->db->order_by('registration_date', 'DESC');
        return $this->db->get($this->table)->result();
    }

    public function get_by_id($id) {
        return $this->db->where('id', $id)->get($this->table)->row();
    }

    public function create($data) {
        $data['registration_date'] = date('Y-m-d H:i:s');
        $this->db->insert($this->table, $data);
        return $this->db->insert_id();
    }

    public function update($id, $data) {
        $this->db->where('id', $id)->update($this->table, $data);
        return $this->db->affected_rows() > 0;
    }

    public function delete($id) {
        $this->db->where('id', $id)->delete($this->table);
        return $this->db->affected_rows() > 0;
    }

    public function exists_cedula($cedula, $exclude_id = null) {
        $this->db->where('cedula', $cedula);
        if ($exclude_id) $this->db->where('id !=', $exclude_id);
        return $this->db->count_all_results($this->table) > 0;
    }
}
```

### Controller: Api (estudiantes)

```php
// Métodos dentro de application/controllers/Api.php

function students_index() {
    $search = $this->input->get('search');
    $page   = (int) $this->input->get('page') ?: 1;
    $limit  = (int) $this->input->get('limit') ?: 15;

    $all = $this->Student_model->get_all($search);
    $total = count($all);
    $data  = array_slice($all, ($page - 1) * $limit, $limit);

    $this->response([
        'status' => 'success',
        'data'   => $data,
        'meta'   => [
            'total'      => $total,
            'page'       => $page,
            'limit'      => $limit,
            'last_page'  => ceil($total / $limit),
        ]
    ], 200);
}

function students_get($id) {
    $student = $this->Student_model->get_by_id($id);
    if (!$student) {
        $this->response(['status' => 'error', 'message' => 'Estudiante no encontrado'], 404);
    }
    $this->response(['status' => 'success', 'data' => $student], 200);
}

function students_create() {
    $this->load->library('form_validation');
    $this->form_validation->set_rules('firstName', 'Nombre', 'required');
    $this->form_validation->set_rules('lastName', 'Apellido', 'required');
    $this->form_validation->set_rules('cedula', 'Cedula', 'required|is_unique[students.cedula]');

    if ($this->form_validation->run() === FALSE) {
        $this->response([
            'status'  => 'error',
            'message' => validation_errors()
        ], 422);
    }

    $id = $this->Student_model->create([
        'first_name'  => $this->input->post('firstName'),
        'last_name'   => $this->input->post('lastName'),
        'cedula'      => $this->input->post('cedula'),
        'birth_date'  => $this->input->post('birthDate'),
        'email'       => $this->input->post('email'),
        'phone'       => $this->input->post('phone'),
        'address'     => $this->input->post('address'),
    ]);

    $this->response([
        'status'  => 'success',
        'data'    => $this->Student_model->get_by_id($id)
    ], 201);
}

function students_update($id) {
    $student = $this->Student_model->get_by_id($id);
    if (!$student) {
        $this->response(['status' => 'error', 'message' => 'Estudiante no encontrado'], 404);
    }

    $data = [];
    $map = [
        'firstName' => 'first_name', 'lastName' => 'last_name',
        'cedula' => 'cedula', 'birthDate' => 'birth_date',
        'email' => 'email', 'phone' => 'phone', 'address' => 'address'
    ];
    foreach ($map as $input => $db) {
        $val = $this->input->post($input);
        if ($val !== null && $val !== '') $data[$db] = $val;
    }

    if (!empty($data)) $this->Student_model->update($id, $data);

    $this->response([
        'status' => 'success',
        'data'   => $this->Student_model->get_by_id($id)
    ], 200);
}

function students_delete($id) {
    if ($this->Student_model->delete($id)) {
        $this->response(['status' => 'success', 'message' => 'Estudiante eliminado'], 200);
    } else {
        $this->response(['status' => 'error', 'message' => 'No encontrado'], 404);
    }
}

function students_search() {
    $q     = $this->input->get('q');
    $page  = (int) $this->input->get('page') ?: 1;
    $limit = (int) $this->input->get('limit') ?: 15;

    $all = $this->Student_model->get_all($q);
    $total = count($all);
    $data  = array_slice($all, ($page - 1) * $limit, $limit);

    $this->response([
        'status' => 'success',
        'data'   => $data,
        'meta'   => ['total' => $total, 'page' => $page]
    ], 200);
}
```

### Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `api/students` | Listar (paginado, search por cedula/nombre) |
| `GET` | `api/students/{id}` | Obtener uno |
| `POST` | `api/students` | Crear |
| `PUT` | `api/students/{id}` | Actualizar |
| `DELETE` | `api/students/{id}` | Eliminar |
| `GET` | `api/students/search?q=` | Buscar por nombre, apellido o cedula |

### Request body `POST`

```json
{
  "firstName": "Juan",
  "lastName": "Perez",
  "cedula": "1234567890",
  "birthDate": "1990-05-15",
  "email": "juan@ejemplo.com",
  "phone": "04121234567",
  "address": "Av. Principal, Caracas"
}
```

### Response exitoso

```json
{
  "status": "success",
  "data": {
    "id": 1,
    "first_name": "Juan",
    "last_name": "Perez",
    "cedula": "1234567890",
    "birth_date": "1990-05-15",
    "email": "juan@ejemplo.com",
    "phone": "04121234567",
    "address": "Av. Principal, Caracas",
    "registration_date": "2026-07-17 00:00:00"
  }
}
```

---

## 2. Examenes (`api/exams`)

### Model: Exam_model

```php
// application/models/Exam_model.php

class Exam_model extends CI_Model {

    protected $table = 'exams';

    public function get_all($filters = []) {
        $this->db->select('*');
        if (!empty($filters['search'])) {
            $this->db->like('name', $filters['search']);
        }
        if (!empty($filters['type'])) {
            $this->db->where('type', $filters['type']);
        }
        if (!empty($filters['status'])) {
            $this->db->where('status', $filters['status']);
        }
        if (!empty($filters['date_from'])) {
            $this->db->where('date >=', $filters['date_from']);
        }
        if (!empty($filters['date_to'])) {
            $this->db->where('date <=', $filters['date_to']);
        }
        $this->db->order_by('date', 'DESC');
        return $this->db->get($this->table)->result();
    }

    public function get_by_id($id) {
        return $this->db->where('id', $id)->get($this->table)->row();
    }

    public function get_scheduled() {
        return $this->db->where('status', 'programado')
            ->order_by('date', 'ASC')
            ->get($this->table)->result();
    }

    public function create($data) {
        $this->db->insert($this->table, $data);
        return $this->db->insert_id();
    }

    public function update($id, $data) {
        $this->db->where('id', $id)->update($this->table, $data);
        return $this->db->affected_rows() > 0;
    }

    public function delete($id) {
        $this->db->where('id', $id)->delete($this->table);
        return $this->db->affected_rows() > 0;
    }
}
```

### Controller: Api (examenes)

```php
function exams_index() {
    $filters = [
        'search'   => $this->input->get('search'),
        'type'     => $this->input->get('type'),
        'status'   => $this->input->get('status'),
        'date_from'=> $this->input->get('date_from'),
        'date_to'  => $this->input->get('date_to'),
    ];
    $page  = (int) $this->input->get('page') ?: 1;
    $limit = (int) $this->input->get('limit') ?: 15;

    $all   = $this->Exam_model->get_all($filters);
    $total = count($all);
    $data  = array_slice($all, ($page - 1) * $limit, $limit);

    $this->response([
        'status' => 'success',
        'data'   => $data,
        'meta'   => ['total' => $total, 'page' => $page, 'limit' => $limit, 'last_page' => ceil($total / $limit)]
    ], 200);
}

function exams_get($id) {
    $exam = $this->Exam_model->get_by_id($id);
    if (!$exam) $this->response(['status' => 'error', 'message' => 'Examen no encontrado'], 404);
    $this->response(['status' => 'success', 'data' => $exam], 200);
}

function exams_scheduled() {
    $this->response([
        'status' => 'success',
        'data'   => $this->Exam_model->get_scheduled()
    ], 200);
}

function exams_create() {
    $this->load->library('form_validation');
    $this->form_validation->set_rules('name', 'Nombre', 'required');
    $this->form_validation->set_rules('type', 'Tipo', 'required|in_list[cedula,titulo,certificado]');
    $this->form_validation->set_rules('date', 'Fecha', 'required');
    $this->form_validation->set_rules('time', 'Hora', 'required');
    $this->form_validation->set_rules('location', 'Lugar', 'required');
    $this->form_validation->set_rules('maxCapacity', 'Cupo', 'required|integer|greater_than[0]');

    if ($this->form_validation->run() === FALSE) {
        $this->response(['status' => 'error', 'message' => validation_errors()], 422);
    }

    $id = $this->Exam_model->create([
        'name'         => $this->input->post('name'),
        'type'         => $this->input->post('type'),
        'date'         => $this->input->post('date'),
        'time'         => $this->input->post('time'),
        'location'     => $this->input->post('location'),
        'max_capacity' => $this->input->post('maxCapacity'),
        'status'       => $this->input->post('status') ?: 'programado',
    ]);

    $this->response([
        'status' => 'success',
        'data'   => $this->Exam_model->get_by_id($id)
    ], 201);
}

function exams_update($id) {
    $exam = $this->Exam_model->get_by_id($id);
    if (!$exam) $this->response(['status' => 'error', 'message' => 'Examen no encontrado'], 404);

    $data = [];
    $map = [
        'name' => 'name', 'type' => 'type', 'date' => 'date',
        'time' => 'time', 'location' => 'location',
        'maxCapacity' => 'max_capacity', 'status' => 'status'
    ];
    foreach ($map as $input => $db) {
        $val = $this->input->post($input);
        if ($val !== null && $val !== '') $data[$db] = $val;
    }

    if (!empty($data)) $this->Exam_model->update($id, $data);

    $this->response(['status' => 'success', 'data' => $this->Exam_model->get_by_id($id)], 200);
}

function exams_delete($id) {
    if ($this->Exam_model->delete($id)) {
        $this->response(['status' => 'success', 'message' => 'Examen eliminado'], 200);
    } else {
        $this->response(['status' => 'error', 'message' => 'No encontrado'], 404);
    }
}
```

### Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `api/exams` | Listar (paginado, filtros) |
| `GET` | `api/exams/{id}` | Obtener uno |
| `GET` | `api/exams/scheduled` | Solo programados |
| `POST` | `api/exams` | Crear |
| `PUT` | `api/exams/{id}` | Actualizar |
| `DELETE` | `api/exams/{id}` | Eliminar |

Query params: `search`, `type`, `status`, `date_from`, `date_to`, `page`, `limit`

---

## 3. Inscripciones (`api/enrollments`)

### Model: Enrollment_model

```php
// application/models/Enrollment_model.php

class Enrollment_model extends CI_Model {

    protected $table = 'enrollments';

    public function get_all($filters = []) {
        $this->db->select('enrollments.*, students.first_name, students.last_name, exams.name as exam_name');
        $this->db->join('students', 'students.id = enrollments.student_id');
        $this->db->join('exams', 'exams.id = enrollments.exam_id');

        if (!empty($filters['search'])) {
            $this->db->group_start();
            $this->db->like('students.first_name', $filters['search']);
            $this->db->or_like('students.last_name', $filters['search']);
            $this->db->or_like('exams.name', $filters['search']);
            $this->db->group_end();
        }
        if (!empty($filters['studentId'])) {
            $this->db->where('enrollments.student_id', $filters['studentId']);
        }
        if (!empty($filters['examId'])) {
            $this->db->where('enrollments.exam_id', $filters['examId']);
        }
        if (!empty($filters['status'])) {
            $this->db->where('enrollments.status', $filters['status']);
        }

        $this->db->order_by('enrollments.enrollment_date', 'DESC');
        return $this->db->get($this->table)->result();
    }

    public function get_by_id($id) {
        return $this->db->where('id', $id)->get($this->table)->row();
    }

    public function is_enrolled($student_id, $exam_id) {
        return $this->db
            ->where('student_id', $student_id)
            ->where('exam_id', $exam_id)
            ->where('status', 'inscrito')
            ->count_all_results($this->table) > 0;
    }

    public function count_enrolled($exam_id) {
        return $this->db
            ->where('exam_id', $exam_id)
            ->where('status', 'inscrito')
            ->count_all_results($this->table);
    }

    public function create($data) {
        $data['enrollment_date'] = date('Y-m-d H:i:s');
        $this->db->insert($this->table, $data);
        return $this->db->insert_id();
    }

    public function update($id, $data) {
        $this->db->where('id', $id)->update($this->table, $data);
        return $this->db->affected_rows() > 0;
    }

    public function delete($id) {
        $this->db->where('id', $id)->delete($this->table);
        return $this->db->affected_rows() > 0;
    }
}
```

### Controller: Api (inscripciones)

```php
function enrollments_index() {
    $filters = [
        'search'    => $this->input->get('search'),
        'studentId' => $this->input->get('studentId'),
        'examId'    => $this->input->get('examId'),
        'status'    => $this->input->get('status'),
    ];
    $page  = (int) $this->input->get('page') ?: 1;
    $limit = (int) $this->input->get('limit') ?: 15;

    $all   = $this->Enrollment_model->get_all($filters);
    $total = count($all);
    $data  = array_slice($all, ($page - 1) * $limit, $limit);

    $this->response([
        'status' => 'success',
        'data'   => $data,
        'meta'   => ['total' => $total, 'page' => $page, 'limit' => $limit, 'last_page' => ceil($total / $limit)]
    ], 200);
}

function enrollments_get($id) {
    $enrollment = $this->Enrollment_model->get_by_id($id);
    if (!$enrollment) $this->response(['status' => 'error', 'message' => 'Inscripcion no encontrada'], 404);
    $this->response(['status' => 'success', 'data' => $enrollment], 200);
}

function enrollments_check() {
    $student_id = $this->input->get('studentId');
    $exam_id    = $this->input->get('examId');

    $this->response([
        'status'  => 'success',
        'enrolled'=> $this->Enrollment_model->is_enrolled($student_id, $exam_id)
    ], 200);
}

function enrollments_create() {
    $this->load->library('form_validation');
    $this->form_validation->set_rules('studentId', 'Estudiante', 'required|integer');
    $this->form_validation->set_rules('examId', 'Examen', 'required|integer');

    if ($this->form_validation->run() === FALSE) {
        $this->response(['status' => 'error', 'message' => validation_errors()], 422);
    }

    $student_id = $this->input->post('studentId');
    $exam_id    = $this->input->post('examId');

    // Validar: no duplicado
    if ($this->Enrollment_model->is_enrolled($student_id, $exam_id)) {
        $this->response(['status' => 'error', 'message' => 'El estudiante ya esta inscrito en este examen'], 422);
    }

    // Validar: examen programado
    $exam = $this->Exam_model->get_by_id($exam_id);
    if (!$exam || $exam->status !== 'programado') {
        $this->response(['status' => 'error', 'message' => 'El examen no esta disponible para inscripcion'], 422);
    }

    // Validar: cupo
    $enrolled = $this->Enrollment_model->count_enrolled($exam_id);
    if ($enrolled >= $exam->max_capacity) {
        $this->response(['status' => 'error', 'message' => 'El examen ha alcanzado su capacidad maxima'], 422);
    }

    $id = $this->Enrollment_model->create([
        'student_id' => $student_id,
        'exam_id'    => $exam_id,
        'status'     => 'inscrito',
    ]);

    $this->response([
        'status' => 'success',
        'data'   => $this->Enrollment_model->get_by_id($id)
    ], 201);
}

function enrollments_update($id) {
    $enrollment = $this->Enrollment_model->get_by_id($id);
    if (!$enrollment) $this->response(['status' => 'error', 'message' => 'Inscripcion no encontrada'], 404);

    $status = $this->input->post('status');
    if ($status) {
        $this->Enrollment_model->update($id, ['status' => $status]);
    }

    $this->response([
        'status' => 'success',
        'data'   => $this->Enrollment_model->get_by_id($id)
    ], 200);
}

function enrollments_delete($id) {
    if ($this->Enrollment_model->delete($id)) {
        $this->response(['status' => 'success', 'message' => 'Inscripcion eliminada'], 200);
    } else {
        $this->response(['status' => 'error', 'message' => 'No encontrado'], 404);
    }
}
```

### Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `api/enrollments` | Listar (paginado, filtros) |
| `GET` | `api/enrollments/{id}` | Obtener una |
| `GET` | `api/enrollments/check?studentId=&examId=` | Verificar inscripcion |
| `POST` | `api/enrollments` | Crear inscripcion |
| `PUT` | `api/enrollments/{id}` | Cambiar status |
| `DELETE` | `api/enrollments/{id}` | Eliminar |

Query params: `search`, `studentId`, `examId`, `status`, `page`, `limit`

---

## 4. Calificaciones (`api/grades`)

### Model: Grade_model

```php
// application/models/Grade_model.php

class Grade_model extends CI_Model {

    protected $table = 'grades';

    public function get_all($filters = []) {
        $this->db->select('grades.*, students.first_name, students.last_name, exams.name as exam_name');
        $this->db->join('enrollments', 'enrollments.id = grades.enrollment_id');
        $this->db->join('students', 'students.id = grades.student_id');
        $this->db->join('exams', 'exams.id = grades.exam_id');

        if (!empty($filters['search'])) {
            $this->db->group_start();
            $this->db->like('students.first_name', $filters['search']);
            $this->db->or_like('students.last_name', $filters['search']);
            $this->db->or_like('exams.name', $filters['search']);
            $this->db->group_end();
        }
        if (!empty($filters['studentId'])) $this->db->where('grades.student_id', $filters['studentId']);
        if (!empty($filters['examId']))    $this->db->where('grades.exam_id', $filters['examId']);
        if (isset($filters['passed']) && $filters['passed'] !== '') {
            $this->db->where('grades.passed', $filters['passed'] === 'true' ? 1 : 0);
        }

        $this->db->order_by('grades.graded_date', 'DESC');
        return $this->db->get($this->table)->result();
    }

    public function get_by_id($id) {
        return $this->db->where('id', $id)->get($this->table)->row();
    }

    public function exists_by_enrollment($enrollment_id) {
        return $this->db->where('enrollment_id', $enrollment_id)->count_all_results($this->table) > 0;
    }

    public function get_passed() {
        return $this->db->where('passed', 1)->order_by('graded_date', 'DESC')->get($this->table)->result();
    }

    public function get_failed() {
        return $this->db->where('passed', 0)->order_by('graded_date', 'DESC')->get($this->table)->result();
    }

    public function count_all()    { return $this->db->count_all($this->table); }
    public function count_passed() { return $this->db->where('passed', 1)->count_all_results($this->table); }
    public function count_failed() { return $this->db->where('passed', 0)->count_all_results($this->table); }

    public function create($data) {
        $data['passed'] = $data['score'] >= 60 ? 1 : 0;
        $this->db->insert($this->table, $data);
        return $this->db->insert_id();
    }

    public function update($id, $data) {
        if (isset($data['score'])) {
            $data['passed'] = $data['score'] >= 60 ? 1 : 0;
        }
        $this->db->where('id', $id)->update($this->table, $data);
        return $this->db->affected_rows() > 0;
    }

    public function delete($id) {
        $this->db->where('id', $id)->delete($this->table);
        return $this->db->affected_rows() > 0;
    }

    public function count_by_student($student_id) {
        return $this->db->where('student_id', $student_id)->count_all_results($this->table);
    }
}
```

### Controller: Api (calificaciones)

```php
function grades_index() {
    $filters = [
        'search'    => $this->input->get('search'),
        'studentId' => $this->input->get('studentId'),
        'examId'    => $this->input->get('examId'),
        'passed'    => $this->input->get('passed'),
    ];
    $page  = (int) $this->input->get('page') ?: 1;
    $limit = (int) $this->input->get('limit') ?: 15;

    $all   = $this->Grade_model->get_all($filters);
    $total = count($all);
    $data  = array_slice($all, ($page - 1) * $limit, $limit);

    $this->response([
        'status' => 'success',
        'data'   => $data,
        'meta'   => ['total' => $total, 'page' => $page, 'limit' => $limit, 'last_page' => ceil($total / $limit)]
    ], 200);
}

function grades_get($id) {
    $grade = $this->Grade_model->get_by_id($id);
    if (!$grade) $this->response(['status' => 'error', 'message' => 'Calificacion no encontrada'], 404);
    $this->response(['status' => 'success', 'data' => $grade], 200);
}

function grades_create() {
    $this->load->library('form_validation');
    $this->form_validation->set_rules('enrollmentId', 'Inscripcion', 'required|integer');
    $this->form_validation->set_rules('score', 'Calificacion', 'required|greater_than_or_equal_to[0]|less_than_or_equal_to[100]');
    $this->form_validation->set_rules('gradedDate', 'Fecha', 'required');

    if ($this->form_validation->run() === FALSE) {
        $this->response(['status' => 'error', 'message' => validation_errors()], 422);
    }

    $enrollment_id = $this->input->post('enrollmentId');

    if ($this->Grade_model->exists_by_enrollment($enrollment_id)) {
        $this->response(['status' => 'error', 'message' => 'Esta inscripcion ya tiene calificacion registrada'], 422);
    }

    $enrollment = $this->Enrollment_model->get_by_id($enrollment_id);
    if (!$enrollment) {
        $this->response(['status' => 'error', 'message' => 'Inscripcion no encontrada'], 404);
    }

    $id = $this->Grade_model->create([
        'enrollment_id' => $enrollment_id,
        'student_id'    => $enrollment->student_id,
        'exam_id'       => $enrollment->exam_id,
        'score'         => $this->input->post('score'),
        'graded_date'   => $this->input->post('gradedDate'),
    ]);

    $this->response([
        'status' => 'success',
        'data'   => $this->Grade_model->get_by_id($id)
    ], 201);
}

function grades_update($id) {
    $grade = $this->Grade_model->get_by_id($id);
    if (!$grade) $this->response(['status' => 'error', 'message' => 'Calificacion no encontrada'], 404);

    $data = [];
    if ($this->input->post('score') !== null) {
        $data['score'] = $this->input->post('score');
    }
    if ($this->input->post('gradedDate') !== null) {
        $data['graded_date'] = $this->input->post('gradedDate');
    }

    if (!empty($data)) $this->Grade_model->update($id, $data);

    $this->response(['status' => 'success', 'data' => $this->Grade_model->get_by_id($id)], 200);
}

function grades_delete($id) {
    if ($this->Grade_model->delete($id)) {
        $this->response(['status' => 'success', 'message' => 'Calificacion eliminada'], 200);
    } else {
        $this->response(['status' => 'error', 'message' => 'No encontrado'], 404);
    }
}
```

### Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `api/grades` | Listar (paginado, filtros) |
| `GET` | `api/grades/{id}` | Obtener una |
| `POST` | `api/grades` | Registrar (1:1 con enrollment) |
| `PUT` | `api/grades/{id}` | Actualizar |
| `DELETE` | `api/grades/{id}` | Eliminar |

Query params: `search`, `studentId`, `examId`, `passed`, `page`, `limit`

---

## 5. Pagos (`api/payments`)

### Model: Payment_model

```php
// application/models/Payment_model.php

class Payment_model extends CI_Model {

    protected $table = 'payments';

    public function get_all($filters = []) {
        $this->db->select('payments.*, students.first_name, students.last_name');
        $this->db->join('students', 'students.id = payments.student_id');

        if (!empty($filters['search'])) {
            $this->db->group_start();
            $this->db->like('students.first_name', $filters['search']);
            $this->db->or_like('students.last_name', $filters['search']);
            $this->db->group_end();
        }
        if (!empty($filters['studentId'])) $this->db->where('payments.student_id', $filters['studentId']);
        if (!empty($filters['concept']))   $this->db->where('payments.concept', $filters['concept']);
        if (!empty($filters['status']))    $this->db->where('payments.status', $filters['status']);

        $this->db->order_by('payments.payment_date', 'DESC');
        return $this->db->get($this->table)->result();
    }

    public function get_by_id($id) {
        return $this->db->where('id', $id)->get($this->table)->row();
    }

    public function create($data) {
        $this->db->insert($this->table, $data);
        return $this->db->insert_id();
    }

    public function update($id, $data) {
        $this->db->where('id', $id)->update($this->table, $data);
        return $this->db->affected_rows() > 0;
    }

    public function delete($id) {
        $this->db->where('id', $id)->delete($this->table);
        return $this->db->affected_rows() > 0;
    }

    public function get_pending() {
        return $this->db->where('status', 'pendiente')
            ->order_by('payment_date', 'DESC')
            ->get($this->table)->result();
    }

    public function get_summary() {
        $pending = $this->db->where('status', 'pendiente')->count_all_results($this->table);
        $paid    = $this->db->where('status', 'pagado')->count_all_results($this->table);
        $sum_pending = $this->db->select_sum('amount')->where('status', 'pendiente')->get($this->table)->row()->amount ?: 0;
        $sum_paid    = $this->db->select_sum('amount')->where('status', 'pagado')->get($this->table)->row()->amount ?: 0;

        return [
            'countPending' => $pending,
            'countPaid'    => $paid,
            'totalPending' => (float) $sum_pending,
            'totalPaid'    => (float) $sum_paid,
        ];
    }
}
```

### Controller: Api (pagos)

```php
function payments_index() {
    $filters = [
        'search'    => $this->input->get('search'),
        'studentId' => $this->input->get('studentId'),
        'concept'   => $this->input->get('concept'),
        'status'    => $this->input->get('status'),
    ];
    $page  = (int) $this->input->get('page') ?: 1;
    $limit = (int) $this->input->get('limit') ?: 15;

    $all   = $this->Payment_model->get_all($filters);
    $total = count($all);
    $data  = array_slice($all, ($page - 1) * $limit, $limit);

    $this->response([
        'status' => 'success',
        'data'   => $data,
        'meta'   => ['total' => $total, 'page' => $page, 'limit' => $limit, 'last_page' => ceil($total / $limit)]
    ], 200);
}

function payments_get($id) {
    $payment = $this->Payment_model->get_by_id($id);
    if (!$payment) $this->response(['status' => 'error', 'message' => 'Pago no encontrado'], 404);
    $this->response(['status' => 'success', 'data' => $payment], 200);
}

function payments_summary() {
    $this->response([
        'status' => 'success',
        'data'   => $this->Payment_model->get_summary()
    ], 200);
}

function payments_create() {
    $this->load->library('form_validation');
    $this->form_validation->set_rules('studentId', 'Estudiante', 'required|integer');
    $this->form_validation->set_rules('concept', 'Concepto', 'required|in_list[inscripcion,examen,certificado,reposicion]');
    $this->form_validation->set_rules('amount', 'Monto', 'required|greater_than[0]');
    $this->form_validation->set_rules('method', 'Metodo', 'required|in_list[efectivo,tarjeta,transferencia]');
    $this->form_validation->set_rules('paymentDate', 'Fecha', 'required');

    if ($this->form_validation->run() === FALSE) {
        $this->response(['status' => 'error', 'message' => validation_errors()], 422);
    }

    $id = $this->Payment_model->create([
        'student_id'   => $this->input->post('studentId'),
        'concept'      => $this->input->post('concept'),
        'amount'       => $this->input->post('amount'),
        'method'       => $this->input->post('method'),
        'payment_date' => $this->input->post('paymentDate'),
        'status'       => $this->input->post('status') ?: 'pendiente',
    ]);

    $this->response([
        'status' => 'success',
        'data'   => $this->Payment_model->get_by_id($id)
    ], 201);
}

function payments_update($id) {
    $payment = $this->Payment_model->get_by_id($id);
    if (!$payment) $this->response(['status' => 'error', 'message' => 'Pago no encontrado'], 404);

    $data = [];
    $map = [
        'studentId' => 'student_id', 'concept' => 'concept',
        'amount' => 'amount', 'method' => 'method',
        'paymentDate' => 'payment_date', 'status' => 'status'
    ];
    foreach ($map as $input => $db) {
        $val = $this->input->post($input);
        if ($val !== null && $val !== '') $data[$db] = $val;
    }

    if (!empty($data)) $this->Payment_model->update($id, $data);

    $this->response(['status' => 'success', 'data' => $this->Payment_model->get_by_id($id)], 200);
}

function payments_delete($id) {
    if ($this->Payment_model->delete($id)) {
        $this->response(['status' => 'success', 'message' => 'Pago eliminado'], 200);
    } else {
        $this->response(['status' => 'error', 'message' => 'No encontrado'], 404);
    }
}
```

### Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `api/payments` | Listar (paginado, filtros) |
| `GET` | `api/payments/{id}` | Obtener uno |
| `GET` | `api/payments/summary` | Totales por estado |
| `POST` | `api/payments` | Crear |
| `PUT` | `api/payments/{id}` | Actualizar |
| `DELETE` | `api/payments/{id}` | Eliminar |

Query params: `search`, `studentId`, `concept`, `status`, `page`, `limit`

---

## 6. Reportes (`api/reports`)

### Controller: Api (reportes)

```php
function reports_passed() {
    $data = $this->Grade_model->get_passed();

    // Enriquecer con nombres
    $result = array_map(function($g) {
        $student = $this->Student_model->get_by_id($g->student_id);
        $exam    = $this->Exam_model->get_by_id($g->exam_id);
        return [
            'student' => $student ? $student->first_name . ' ' . $student->last_name : 'Desconocido',
            'exam'    => $exam ? $exam->name : 'Desconocido',
            'score'   => (float) $g->score,
            'date'    => $g->graded_date,
        ];
    }, $data);

    $this->response(['status' => 'success', 'data' => $result], 200);
}

function reports_failed() {
    $data = $this->Grade_model->get_failed();

    $result = array_map(function($g) {
        $student = $this->Student_model->get_by_id($g->student_id);
        $exam    = $this->Exam_model->get_by_id($g->exam_id);
        return [
            'student' => $student ? $student->first_name . ' ' . $student->last_name : 'Desconocido',
            'exam'    => $exam ? $exam->name : 'Desconocido',
            'score'   => (float) $g->score,
            'date'    => $g->graded_date,
        ];
    }, $data);

    $this->response(['status' => 'success', 'data' => $result], 200);
}

function reports_pending_payments() {
    $data = $this->Payment_model->get_pending();
    $this->response(['status' => 'success', 'data' => $data], 200);
}

function reports_all_students() {
    $students = $this->Student_model->get_all();

    $result = array_map(function($s) {
        return [
            'name'             => $s->first_name . ' ' . $s->last_name,
            'cedula'           => $s->cedula,
            'phone'            => $s->phone,
            'email'            => $s->email,
            'registrationDate' => $s->registration_date,
        ];
    }, $students);

    $this->response(['status' => 'success', 'data' => $result], 200);
}

function reports_stats() {
    $students = $this->Student_model->get_all();
    $exams    = $this->Exam_model->get_all();
    $summary  = $this->Payment_model->get_summary();
    $total    = $this->Grade_model->count_all();
    $passed   = $this->Grade_model->count_passed();

    $this->response([
        'status' => 'success',
        'data'   => [
            'totalStudents'       => count($students),
            'totalExams'          => count($exams),
            'totalGrades'         => $total,
            'passedGrades'        => $passed,
            'failedGrades'        => $total - $passed,
            'passRate'            => $total > 0 ? round(($passed / $total) * 100) : 0,
            'totalPendingPayments'=> $summary['countPending'],
            'totalPaidAmount'     => $summary['totalPaid'],
        ]
    ], 200);
}
```

### Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `api/reports/passed` | Aprobados (score >= 60) |
| `GET` | `api/reports/failed` | Reprobados (score < 60) |
| `GET` | `api/reports/pending-payments` | Pagos pendientes |
| `GET` | `api/reports/all-students` | Todos los estudiantes |
| `GET` | `api/reports/stats` | Estadisticas generales |

---

## 7. Dashboard (`api/dashboard`)

### Controller: Api (dashboard)

```php
function dashboard() {
    $students = $this->Student_model->get_all();
    $exams    = $this->Exam_model->get_scheduled();
    $grades   = $this->Grade_model->get_all();
    $summary  = $this->Payment_model->get_summary();

    $passed_count = $this->Grade_model->count_passed();

    // 5 calificaciones mas recientes
    $recent_grades = array_slice($grades, 0, 5);
    $enriched_grades = array_map(function($g) {
        $student = $this->Student_model->get_by_id($g->student_id);
        $exam    = $this->Exam_model->get_by_id($g->exam_id);
        return [
            'id'            => $g->id,
            'enrollmentId'  => $g->enrollment_id,
            'studentId'     => $g->student_id,
            'examId'        => $g->exam_id,
            'score'         => (float) $g->score,
            'passed'        => (bool) $g->passed,
            'gradedDate'    => $g->graded_date,
        ];
    }, $recent_grades);

    // 5 examenes programados
    $scheduled = array_slice($exams, 0, 5);

    $this->response([
        'status' => 'success',
        'data'   => [
            'stats' => [
                'totalStudents'  => count($students),
                'totalExams'     => $this->Exam_model->get_all() ? count($this->Exam_model->get_all()) : 0,
                'passedGrades'   => $passed_count,
                'pendingPayments'=> $summary['countPending'],
            ],
            'recentGrades'  => $enriched_grades,
            'scheduledExams'=> $scheduled,
        ]
    ], 200);
}
```

### Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `api/dashboard` | Stats + calificaciones recientes + examenes programados |

---

## SQL Schema

```sql
CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    cedula VARCHAR(20) NOT NULL UNIQUE,
    birth_date DATE NULL,
    email VARCHAR(150) NULL,
    phone VARCHAR(30) NULL,
    address TEXT NULL,
    registration_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_cedula (cedula),
    INDEX idx_name (last_name, first_name)
) ENGINE=InnoDB;

CREATE TABLE exams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    type ENUM('cedula','titulo','certificado') NOT NULL,
    date DATE NOT NULL,
    time VARCHAR(10) NOT NULL,
    location VARCHAR(200) NOT NULL,
    max_capacity INT NOT NULL DEFAULT 30,
    status ENUM('programado','en_curso','finalizado','cancelado') NOT NULL DEFAULT 'programado',
    INDEX idx_status (status),
    INDEX idx_date (date)
) ENGINE=InnoDB;

CREATE TABLE enrollments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    exam_id INT NOT NULL,
    enrollment_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status ENUM('inscrito','completado','cancelado') NOT NULL DEFAULT 'inscrito',
    UNIQUE KEY uk_active_enrollment (student_id, exam_id, status),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
    INDEX idx_student (student_id),
    INDEX idx_exam (exam_id),
    INDEX idx_status (status)
) ENGINE=InnoDB;

CREATE TABLE grades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    enrollment_id INT NOT NULL UNIQUE,
    student_id INT NOT NULL,
    exam_id INT NOT NULL,
    score DECIMAL(5,2) NOT NULL CHECK (score BETWEEN 0 AND 100),
    passed TINYINT(1) NOT NULL DEFAULT 0,
    graded_date DATE NOT NULL,
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
    INDEX idx_student (student_id),
    INDEX idx_exam (exam_id),
    INDEX idx_passed (passed)
) ENGINE=InnoDB;

CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    concept ENUM('inscripcion','examen','certificado','reposicion') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATE NOT NULL,
    method ENUM('efectivo','tarjeta','transferencia') NOT NULL,
    status ENUM('pendiente','pagado') NOT NULL DEFAULT 'pendiente',
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    INDEX idx_student (student_id),
    INDEX idx_status (status),
    INDEX idx_concept (concept)
) ENGINE=InnoDB;
```

---

## Seeders

```sql
INSERT INTO students (first_name, last_name, cedula, birth_date, email, phone, address) VALUES
('Maria', 'Garcia', '20123456', '1988-03-10', 'maria@mail.com', '04125551234', 'Calle 5, Maracaibo'),
('Carlos', 'Lopez', '18987654', '1995-07-22', 'carlos@mail.com', '04145559876', 'Av. Libertador, Caracas'),
('Ana', 'Rodriguez', '25456789', '1992-11-05', 'ana@mail.com', '04165553456', 'Carrera 7, Barquisimeto'),
('Pedro', 'Martinez', '19765432', '1985-01-18', 'pedro@mail.com', '04245557890', 'Av. Bolivar, Valencia');

INSERT INTO exams (name, type, date, time, location, max_capacity, status) VALUES
('Examen de Cedula - Agosto 2026', 'cedula', '2026-08-15', '09:00', 'Aula 101', 30, 'programado'),
('Examen de Titulo - Septiembre 2026', 'titulo', '2026-09-20', '14:00', 'Auditorio', 50, 'programado'),
('Examen de Certificado - Octubre 2026', 'certificado', '2026-10-10', '10:00', 'Aula 205', 25, 'programado');
```
