import express from 'express'
import { turso } from '../database/connection.js'

const router = express.Router()

// obtener todos los alumnos de todos los tutores
router.get('/getAllStudentsByTutor', async (req, res) => {
  try {
    const result = await turso.execute(
      "SELECT Tutores.id AS tutor_id, Tutores.nombres || ' ' || Tutores.apellidos AS tutor_nombre, Alumnos.id AS alumno_id, Alumnos.nombres || ' ' || Alumnos.apellidos AS alumno_nombre FROM Tutores LEFT JOIN Alumnos ON Tutores.id = Alumnos.tutor_id ORDER BY Tutores.id, Alumnos.id"
    )
    const columns = result.columns
    const rows = result.rows

    const students = rows.map((row) => {
      const student = {}
      columns.forEach((col, index) => {
        student[col] = row[index]
      })
      return student
    })

    const groupedByTutor = students.reduce((acc, student) => {
      const tutorId = student.tutor_id
      if (!acc[tutorId]) {
        acc[tutorId] = {
          tutor_id: tutorId,
          tutor_nombre: student.tutor_nombre,
          alumnos: []
        }
      }
      acc[tutorId].alumnos.push({
        alumno_id: student.alumno_id,
        alumno_nombre: student.alumno_nombre
      })
      return acc
    }, {})

    const groupedByTutorArray = Object.values(groupedByTutor)

    res.status(200).json(groupedByTutorArray)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// obtener todos los alumnos de un tutor
router.get('/getStudentsByTutor/:tutorId', async (req, res) => {
  try {
    const tutorId = req.params.tutorId
    const result = await turso.execute({
      sql: 'SELECT Alumnos.id AS AlumnoID, Alumnos.nombres AS AlumnoNombres, Alumnos.apellidos AS AlumnoApellidos, Alumnos.fecha_nacimiento AS AlumnoFechaNacimiento, Alumnos.telefono AS AlumnoTelefono, Alumnos.direccion AS AlumnoDireccion, Alumnos.activo AS AlumnoActivo, Alumnos.observaciones AS AlumnoObservaciones FROM Alumnos JOIN Tutores ON Alumnos.tutor_id = Tutores.id WHERE Tutores.id = ?;',
      args: [tutorId]
    })

    const columns = result.columns
    const rows = result.rows

    const students = rows.map((row) => {
      const student = {}
      columns.forEach((col, index) => {
        student[col] = row[index]
      })
      return student
    })

    res.status(200).json(students)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// obtener tutores asignados a un modulo
router.get('/getTutorsByModule/:moduleId', async (req, res) => {
  try {
    const moduleId = req.params.moduleId
    const result = await turso.execute({
      sql: 'SELECT Tutores.id AS TutorID, Tutores.nombres AS TutorNombres, Tutores.apellidos AS TutorApellidos, Tutores.telefono AS TutorTelefono, Tutores.direccion AS TutorDireccion, Tutores.activo AS TutorActivo, Tutores.observaciones AS TutorObservaciones FROM Tutores JOIN Modulos ON Tutores.modulo_id = Modulos.id WHERE Modulos.id = ?;',
      args: [moduleId]
    })

    const columns = result.columns
    const rows = result.rows

    const tutors = rows.map((row) => {
      const tutor = {}
      columns.forEach((col, index) => {
        tutor[col] = row[index]
      })
      return tutor
    })

    res.status(200).json(tutors)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// obtener todos los alumnos de un modulo y de un tutor
router.get(
  '/getStudentsByModuleAndTutor/:moduleId/:tutorId',
  async (req, res) => {
    try {
      const moduleId = req.params.moduleId
      const tutorId = req.params.tutorId

      const result = await turso.execute({
        sql: `SELECT
              Alumnos.id AS AlumnoID,
              Alumnos.nombres AS AlumnoNombres,
              Alumnos.apellidos AS AlumnoApellidos,
              Alumnos.fecha_nacimiento AS AlumnoFechaNacimiento,
              Alumnos.telefono AS AlumnoTelefono,
              Alumnos.direccion AS AlumnoDireccion,
              Alumnos.activo AS AlumnoActivo,
              Alumnos.observaciones AS AlumnoObservaciones
            FROM
              Alumnos
            JOIN
              Tutores ON Alumnos.tutor_id = Tutores.id
            WHERE
              Alumnos.modulo_id = ? AND Tutores.id = ?;`,
        args: [moduleId, tutorId]
      })

      const columns = result.columns
      const rows = result.rows

      const students = rows.map((row) => {
        const student = {}
        columns.forEach((col, index) => {
          student[col] = row[index]
        })
        return student
      })

      res.status(200).json(students)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }
)

// obtener todos los alumnos de un modulo y su tutor
router.get('/getStudentsByModule/:moduleId', async (req, res) => {
  try {
    const moduleId = req.params.moduleId
    const result = await turso.execute({
      sql: `
        SELECT
          Tutores.id AS TutorID,
          Tutores.nombres AS TutorNombres,
          Tutores.apellidos AS TutorApellidos,
          Alumnos.id AS AlumnoID,
          Alumnos.nombres AS AlumnoNombres,
          Alumnos.apellidos AS AlumnoApellidos,
          Alumnos.telefono AS AlumnoTelefono,
          Alumnos.activo AS AlumnoActivo
        FROM Tutores
        JOIN Alumnos ON Tutores.id = Alumnos.tutor_id
        WHERE Tutores.modulo_id = ?;
      `,
      args: [moduleId]
    })

    const columns = result.columns
    const rows = result.rows

    const students = rows.map((row) => {
      const student = {}
      columns.forEach((col, index) => {
        student[col] = row[index]
      })
      return {
        alumno_id: student.AlumnoID,
        alumno_nombres: student.AlumnoNombres + ' ' + student.AlumnoApellidos,
        alumno_telefono: student.AlumnoTelefono,
        tutor_nombre: student.TutorNombres + ' ' + student.TutorApellidos,
        alumno_activo: student.AlumnoActivo
      }
    })

    res.status(200).json(students)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// obtener sumatoria de asistencias por tipo dandole una fecha
router.get('/getAttendanceByDate/:date', async (req, res) => {
  try {
    const date = req.params.date

    const result = await turso.execute({
      sql: `
        SELECT
          Tutores.id AS TutorID,
          Tutores.nombres || ' ' || Tutores.apellidos AS TutorNombres,
          COUNT(Asistencias.id) AS TotalAsistencias,
          SUM(CASE WHEN Asistencias.tipo = 'Presencial' THEN 1 ELSE 0 END) AS AsistenciasPresenciales,
          SUM(CASE WHEN Asistencias.tipo = 'Virtual' THEN 1 ELSE 0 END) AS AsistenciasVirtuales
        FROM Tutores
        JOIN Alumnos ON Tutores.id = Alumnos.tutor_id
        JOIN Asistencias ON Alumnos.id = Asistencias.alumno_id
        WHERE DATE(Asistencias.fecha) = ?
        GROUP BY Tutores.id, TutorNombres;
      `,
      args: [date]
    })

    const columns = result.columns
    const rows = result.rows

    const attendance = rows.map((row) => {
      return {
        TutorID: row[columns.indexOf('TutorID')],
        TutorNombres: row[columns.indexOf('TutorNombres')],
        AsistenciasPresenciales:
          row[columns.indexOf('AsistenciasPresenciales')],
        AsistenciasVirtuales: row[columns.indexOf('AsistenciasVirtuales')],
        TotalAsistencias: row[columns.indexOf('TotalAsistencias')]
      }
    })

    res.status(200).json(attendance)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Convertir el mes y año en un rango de fechas
const getDateRangeFromMonthYear = (monthYear) => {
  const [month, year] = monthYear.split('-')
  const startDate = `${year}-${month}-01`
  const endDate = new Date(year, month, 0) // último día del mes
  return { startDate, endDate: endDate.toISOString().split('T')[0] }
}

// // obtener los alumnos que asistieron en una fecha dada y por un tutor
// router.get('/getAttendanceByDateAndTutor/:date/:tutorId', async (req, res) => {
//   try {
//     const { date, tutorId } = req.params

//     // Obtener alumnos que asistieron en la fecha dada
//     const attendedResult = await turso.execute({
//       sql: `
//         SELECT
//           Alumnos.id AS AlumnoID,
//           Alumnos.nombres || ' ' || Alumnos.apellidos AS AlumnoNombres,
//           Alumnos.telefono AS AlumnoTelefono,
//           Asistencias.tipo AS TipoAsistencia
//         FROM Alumnos
//         JOIN Asistencias ON Alumnos.id = Asistencias.alumno_id
//         WHERE Asistencias.fecha = ? AND Alumnos.tutor_id = ?;
//       `,
//       args: [date, tutorId]
//     })

//     // Obtener alumnos que no asistieron en la fecha dada
//     const notAttendedResult = await turso.execute({
//       sql: `
//         SELECT
//           Alumnos.id AS AlumnoID,
//           Alumnos.nombres || ' ' || Alumnos.apellidos AS AlumnoNombres,
//           Alumnos.telefono AS AlumnoTelefono
//         FROM Alumnos
//         WHERE Alumnos.tutor_id = ? AND Alumnos.id NOT IN (
//           SELECT alumno_id
//           FROM Asistencias
//           WHERE fecha = ?
//         );
//       `,
//       args: [tutorId, date]
//     })

//     const attendedColumns = attendedResult.columns
//     const attendedRows = attendedResult.rows
//     const notAttendedColumns = notAttendedResult.columns
//     const notAttendedRows = notAttendedResult.rows

//     const attendedStudents = attendedRows.map((row) => {
//       return {
//         AlumnoID: row[attendedColumns.indexOf('AlumnoID')],
//         AlumnoNombres: row[attendedColumns.indexOf('AlumnoNombres')],
//         AlumnoTelefono: row[attendedColumns.indexOf('AlumnoTelefono')],
//         TipoAsistencia: row[attendedColumns.indexOf('TipoAsistencia')]
//       }
//     })

//     const notAttendedStudents = notAttendedRows.map((row) => {
//       return {
//         AlumnoID: row[notAttendedColumns.indexOf('AlumnoID')],
//         AlumnoNombres: row[notAttendedColumns.indexOf('AlumnoNombres')],
//         AlumnoTelefono: row[notAttendedColumns.indexOf('AlumnoTelefono')]
//       }
//     })

//     res.status(200).json({
//       attendedStudents,
//       notAttendedStudents
//     })
//   } catch (error) {
//     res.status(500).json({ error: error.message })
//   }
// })

// obtener los alumnos que asistieron y no asistieron en una fecha dada y por un tutor
router.get('/getAttendanceByDateAndTutor/:date/:tutorId', async (req, res) => {
  try {
    const { date, tutorId } = req.params

    // Obtener alumnos que asistieron y no asistieron en la fecha dada
    const result = await turso.execute({
      sql: `
        SELECT
          Alumnos.id AS AlumnoID,
          Alumnos.nombres || ' ' || Alumnos.apellidos AS AlumnoNombres,
          Alumnos.telefono AS AlumnoTelefono,
          Asistencias.tipo AS TipoAsistencia,
          Asistencias.pregunta as Pregunta
        FROM Alumnos
        LEFT JOIN Asistencias ON Alumnos.id = Asistencias.alumno_id AND Asistencias.fecha = ?
        WHERE Alumnos.tutor_id = ?;
      `,
      args: [date, tutorId]
    })

    console.log(result)
    const columns = result.columns
    const rows = result.rows

    const attendedStudents = []
    const notAttendedStudents = []

    rows.forEach((row) => {
      const student = {
        AlumnoID: row[columns.indexOf('AlumnoID')],
        AlumnoNombres: row[columns.indexOf('AlumnoNombres')],
        AlumnoTelefono: row[columns.indexOf('AlumnoTelefono')],
        TipoAsistencia: row[columns.indexOf('TipoAsistencia')],
        Pregunta: row[columns.indexOf('Pregunta')]
      }
      if (student.TipoAsistencia) {
        attendedStudents.push(student)
      } else {
        delete student.TipoAsistencia
        notAttendedStudents.push(student)
      }
    })

    res.status(200).json({
      attendedStudents,
      notAttendedStudents
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Obtener sumatoria de asistencias por tipo dado un mes y año
router.get('/getAttendanceByMonth/:monthYear', async (req, res) => {
  try {
    const { monthYear } = req.params
    const { startDate, endDate } = getDateRangeFromMonthYear(monthYear)

    const result = await turso.execute({
      sql: `
        SELECT
          Tutores.id AS TutorID,
          Tutores.nombres || ' ' || Tutores.apellidos AS TutorNombres,
          DATE(Asistencias.fecha) AS Fecha,
          COUNT(Asistencias.id) AS TotalAsistencias,
          SUM(CASE WHEN Asistencias.tipo = 'Presencial' THEN 1 ELSE 0 END) AS AsistenciasPresenciales,
          SUM(CASE WHEN Asistencias.tipo = 'Virtual' THEN 1 ELSE 0 END) AS AsistenciasVirtuales
        FROM Tutores
        JOIN Alumnos ON Tutores.id = Alumnos.tutor_id
        JOIN Asistencias ON Alumnos.id = Asistencias.alumno_id
        WHERE DATE(Asistencias.fecha) BETWEEN ? AND ?
        GROUP BY Tutores.id, TutorNombres, Fecha;
      `,
      args: [startDate, endDate]
    })

    const columns = result.columns
    const rows = result.rows

    const attendanceByTutor = rows.reduce((acc, row) => {
      const tutorId = row[columns.indexOf('TutorID')]
      const tutorNombre = row[columns.indexOf('TutorNombres')]
      const fecha = row[columns.indexOf('Fecha')]
      const asistenciasPresenciales =
        row[columns.indexOf('AsistenciasPresenciales')]
      const asistenciasVirtuales = row[columns.indexOf('AsistenciasVirtuales')]
      const totalAsistencias = row[columns.indexOf('TotalAsistencias')]

      if (!acc[tutorId]) {
        acc[tutorId] = {
          TutorID: tutorId,
          TutorNombres: tutorNombre,
          TotalAsistencias: 0,
          fechas: []
        }
      }

      acc[tutorId].TotalAsistencias += totalAsistencias
      acc[tutorId].fechas.push({
        fecha,
        AsistenciasPresenciales: asistenciasPresenciales,
        AsistenciasVirtuales: asistenciasVirtuales,
        TotalAsistencias: totalAsistencias
      })

      return acc
    }, {})

    const attendanceArray = Object.values(attendanceByTutor)

    res.status(200).json(attendanceArray)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Obtener sumatoria de asistencias por tipo dado un mes, año y tutor ID
router.get(
  '/getAttendanceByMonthAndTutor/:monthYear/:tutorId',
  async (req, res) => {
    try {
      const { monthYear, tutorId } = req.params
      const { startDate, endDate } = getDateRangeFromMonthYear(monthYear)

      const result = await turso.execute({
        sql: `
        SELECT
          Tutores.id AS TutorID,
          Tutores.nombres || ' ' || Tutores.apellidos AS TutorNombres,
          DATE(Asistencias.fecha) AS Fecha,
          COUNT(Asistencias.id) AS TotalAsistencias,
          SUM(CASE WHEN Asistencias.tipo = 'Presencial' THEN 1 ELSE 0 END) AS AsistenciasPresenciales,
          SUM(CASE WHEN Asistencias.tipo = 'Virtual' THEN 1 ELSE 0 END) AS AsistenciasVirtuales
        FROM Tutores
        JOIN Alumnos ON Tutores.id = Alumnos.tutor_id
        JOIN Asistencias ON Alumnos.id = Asistencias.alumno_id
        WHERE DATE(Asistencias.fecha) BETWEEN ? AND ?
          AND Tutores.id = ?
        GROUP BY Tutores.id, TutorNombres, Fecha;
      `,
        args: [startDate, endDate, tutorId]
      })

      const columns = result.columns
      const rows = result.rows

      const attendanceByTutor = rows.reduce((acc, row) => {
        const tutorId = row[columns.indexOf('TutorID')]
        const tutorNombre = row[columns.indexOf('TutorNombres')]
        const fecha = row[columns.indexOf('Fecha')]
        const asistenciasPresenciales =
          row[columns.indexOf('AsistenciasPresenciales')]
        const asistenciasVirtuales =
          row[columns.indexOf('AsistenciasVirtuales')]
        const totalAsistencias = row[columns.indexOf('TotalAsistencias')]

        if (!acc[tutorId]) {
          acc[tutorId] = {
            TutorID: tutorId,
            TutorNombres: tutorNombre,
            TotalAsistencias: 0,
            fechas: []
          }
        }

        acc[tutorId].TotalAsistencias += totalAsistencias
        acc[tutorId].fechas.push({
          fecha,
          AsistenciasPresenciales: asistenciasPresenciales,
          AsistenciasVirtuales: asistenciasVirtuales,
          TotalAsistencias: totalAsistencias
        })

        return acc
      }, {})

      const attendanceArray = Object.values(attendanceByTutor)

      res.status(200).json(attendanceArray)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }
)

// obtener alumnos pendientes por tutor y sin tutor
// para todos los pendientes usar: /getPendingStudents
// para los pendientes de un tutor usar: /getPendingStudents?tutorId=1
router.get('/getPendingStudents', async (req, res) => {
  try {
    const tutorId = req.query.tutorId
    let query
    let args

    if (tutorId) {
      // Consulta cuando se pasa el id del tutor
      query = `
        SELECT
          Alumnos.id AS idAlumno,
          Alumnos.nombres || ' ' || Alumnos.apellidos AS nombreAlumno
        FROM Alumnos
        WHERE Alumnos.tutor_id = ? AND Alumnos.activo = 'Pendiente';
      `
      args = [tutorId]
    } else {
      // Consulta cuando no se pasa el id del tutor
      query = `
        SELECT
          Tutores.id AS idTutor,
          Tutores.nombres || ' ' || Tutores.apellidos AS NombreTutor,
          Alumnos.id AS idAlumno,
          Alumnos.nombres || ' ' || Alumnos.apellidos AS nombreAlumno
        FROM Tutores
        JOIN Alumnos ON Tutores.id = Alumnos.tutor_id
        WHERE Alumnos.activo = 'Pendiente';
      `
      args = []
    }

    const result = await turso.execute({
      sql: query,
      args
    })

    const columns = result.columns
    const rows = result.rows

    if (tutorId) {
      // Formateo de la respuesta cuando se pasa el id del tutor
      const students = rows.map((row) => {
        const student = {}
        columns.forEach((col, index) => {
          student[col] = row[index]
        })
        return student
      })

      res.status(200).json(students)
    } else {
      // Formateo de la respuesta cuando no se pasa el id del tutor
      const tutors = rows.reduce((acc, row) => {
        const tutorIndex = acc.findIndex(
          (t) => t.idTutor === row[columns.indexOf('idTutor')]
        )
        if (tutorIndex === -1) {
          acc.push({
            idTutor: row[columns.indexOf('idTutor')],
            NombreTutor: row[columns.indexOf('NombreTutor')],
            Alumnos: [
              {
                idAlumno: row[columns.indexOf('idAlumno')],
                nombreAlumno: row[columns.indexOf('nombreAlumno')]
              }
            ]
          })
        } else {
          acc[tutorIndex].Alumnos.push({
            idAlumno: row[columns.indexOf('idAlumno')],
            nombreAlumno: row[columns.indexOf('nombreAlumno')]
          })
        }
        return acc
      }, [])

      res.status(200).json(tutors)
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
