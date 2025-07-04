'use client';

import type { Syllabus } from '@/types/syllabus';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Image from 'next/image';

interface PrintableSyllabusProps {
  syllabus: Syllabus;
}

const thStyle = "p-2 text-left font-semibold border-b-2 border-gray-600 bg-gray-100 align-top";
const tdStyle = "p-2 text-left border-b border-gray-300 align-top";
const h2Style = "text-xl font-bold mb-4 border-b border-gray-400 pb-2";
const h3Style = "text-lg font-semibold mb-2 bg-gray-100 p-2 border border-gray-300";
const h4Style = "font-semibold my-2";

export function PrintableSyllabus({ syllabus }: PrintableSyllabusProps) {
  
  return (
    <div className="font-sans text-sm text-gray-800 space-y-8">
      {/* Header */}
      <div className="text-center pb-4 border-b-2 border-gray-800">
        <h1 className="text-3xl font-bold uppercase tracking-wider">{syllabus.courseName}</h1>
        <p className="text-lg">Plan de Estudio</p>
      </div>

      {/* I. General Information */}
      <section>
        <h2 className={h2Style}>I. Información General del Curso</h2>
        <table className="w-full border-collapse">
          <tbody>
            <tr>
              <td className={`${tdStyle} font-semibold w-1/3`}>Nombre del curso:</td>
              <td className={tdStyle}>{syllabus.courseName}</td>
            </tr>
            <tr>
              <td className={`${tdStyle} font-semibold`}>Clave:</td>
              <td className={tdStyle}>{syllabus.courseKey}</td>
            </tr>
            <tr>
              <td className={`${tdStyle} font-semibold`}>Créditos:</td>
              <td className={tdStyle}>{syllabus.credits}</td>
            </tr>
            <tr>
              <td className={`${tdStyle} font-semibold`}>Horas teóricas:</td>
              <td className={tdStyle}>{syllabus.theoryHours}</td>
            </tr>
            <tr>
              <td className={`${tdStyle} font-semibold`}>Horas prácticas:</td>
              <td className={tdStyle}>{syllabus.practiceHours}</td>
            </tr>
            <tr>
              <td className={`${tdStyle} font-semibold`}>Elaboró:</td>
              <td className={tdStyle}>{syllabus.author}</td>
            </tr>
            <tr>
              <td className={`${tdStyle} font-semibold`}>Fecha de elaboración:</td>
              <td className={tdStyle}>{syllabus.creationDate ? format(new Date(syllabus.creationDate), "dd 'de' MMMM 'de' yyyy", { locale: es }) : ''}</td>
            </tr>
             <tr>
              <td className={`${tdStyle} font-semibold`}>Fecha de última actualización:</td>
              <td className={tdStyle}>{syllabus.updateDate ? format(new Date(syllabus.updateDate), "dd 'de' MMMM 'de' yyyy", { locale: es }) : ''}</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* II. Competencies */}
      <section>
        <h2 className={h2Style}>II. Gestión de Competencias</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-1">Competencia del Perfil de Egreso:</h3>
            <p className="pl-4 whitespace-pre-wrap">{syllabus.graduateCompetency}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Competencia del Curso:</h3>
            <p className="pl-4 whitespace-pre-wrap">{syllabus.courseCompetency}</p>
          </div>
        </div>
      </section>

      {/* III. Summary and Prerequisites */}
       <section>
        <h2 className={h2Style}>III. Resumen y Prerrequisitos</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-1">Competencias Previas Requeridas:</h3>
            <p className="pl-4 whitespace-pre-wrap">{syllabus.prerequisites}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Resumen del Curso:</h3>
            <p className="pl-4 whitespace-pre-wrap">{syllabus.summary}</p>
          </div>
        </div>
      </section>
      
      {/* IV. Evaluation Criteria */}
      <section className="break-after-page">
        <h2 className={h2Style}>IV. Criterios de Evaluación</h2>
        <table className="w-full border-collapse border border-gray-300">
            <thead>
                <tr>
                    <th className={thStyle}>Evaluación</th>
                    <th className={thStyle}>Peso (%)</th>
                    <th className={thStyle}>Instrumento</th>
                    <th className={thStyle}>Fecha</th>
                </tr>
            </thead>
            <tbody>
                {(syllabus.evaluationCriteria || []).map(criterion => (
                    <tr key={criterion.id}>
                        <td className={tdStyle}>{criterion.evaluation}</td>
                        <td className={`${tdStyle} text-center`}>{criterion.weight}</td>
                        <td className={tdStyle}>{criterion.instrument}</td>
                        <td className={tdStyle}>{criterion.date ? format(new Date(criterion.date), 'dd/MM/yyyy') : 'N/A'}</td>
                    </tr>
                ))}
            </tbody>
        </table>
      </section>
      
      {/* V. Learning Units */}
      <section>
        <h2 className={h2Style}>V. Unidades de Aprendizaje</h2>
        {(syllabus.learningUnits || []).map((unit, unitIndex) => (
          <div key={unit.id} className="mb-6 break-inside-avoid">
            <h3 className={h3Style}>UNIDAD {unitIndex + 1}: {unit.denomination}</h3>
            <table className="w-full border-collapse border border-gray-300">
                <tbody>
                    <tr>
                        <td className={`${tdStyle} font-semibold w-1/4`}>Intervalo de fechas:</td>
                        <td className={tdStyle}>
                            {unit.startDate ? format(new Date(unit.startDate), "dd 'de' MMMM", { locale: es }) : ''} al {unit.endDate ? format(new Date(unit.endDate), "dd 'de' MMMM 'de' yyyy", { locale: es }) : ''}
                        </td>
                    </tr>
                    <tr>
                        <td className={`${tdStyle} font-semibold`}>Enunciado de la capacidad a ser lograda por el estudiante:</td>
                        <td className={`${tdStyle} whitespace-pre-wrap`}>{unit.studentCapacity}</td>
                    </tr>
                </tbody>
            </table>
            
            <h4 className={h4Style}>Semanas y Contenidos Específicos</h4>
            <table className="w-full border-collapse border border-gray-300 mt-[-1px]">
              <thead>
                <tr>
                  <th className={`${thStyle} w-1/5`}>Semana</th>
                  <th className={`${thStyle} w-4/5`}>Contenidos Específicos</th>
                </tr>
              </thead>
              <tbody>
                {(unit.weeks || []).map((week, weekIndex) => (
                  <tr key={week.id}>
                    <td className={`${tdStyle} text-center`}>{weekIndex + 1}</td>
                    <td className={`${tdStyle} whitespace-pre-wrap`}>{week.specificContents}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4">
              <h4 className={h4Style}>Metodología</h4>
              <p className="pl-4">{unit.methodology === 'Otro' ? unit.customMethodology : unit.methodology}</p>
            </div>

            <div className="mt-4">
              <h4 className={h4Style}>Fuentes de Consulta Documental y Sitios Web</h4>
              <div className="pl-4 whitespace-pre-wrap">{unit.apaReference}</div>
            </div>

          </div>
        ))}
      </section>
      
      {/* Signature */}
      <section className="pt-24">
         <div className="flex justify-center">
            {syllabus.signaturePreview ? (
               <div className="flex flex-col items-center">
                <Image
                    src={syllabus.signaturePreview}
                    alt="Firma del docente"
                    width={250}
                    height={125}
                    style={{ objectFit: 'contain' }}
                  />
                <div className="border-t-2 border-gray-700 w-72 mt-2"></div>
                <p className="mt-1 font-semibold">{syllabus.author}</p>
                <p>Firma del Docente</p>
               </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="border-t-2 border-gray-700 w-72 mt-24"></div>
                <p className="mt-1 font-semibold">{syllabus.author}</p>
                <p>Firma del Docente</p>
              </div>
            )}
        </div>
      </section>
    </div>
  );
}
