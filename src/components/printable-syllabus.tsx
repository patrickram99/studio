'use client';

import type { Syllabus } from '@/types/syllabus';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Image from 'next/image';

interface PrintableSyllabusProps {
  syllabus: Syllabus;
}

const thStyle = "p-2 text-left font-semibold border-b-2 border-gray-600 bg-gray-100";
const tdStyle = "p-2 text-left border-b border-gray-300";

export function PrintableSyllabus({ syllabus }: PrintableSyllabusProps) {
  const weekCounter = (() => {
    let count = 0;
    return () => ++count;
  })();

  return (
    <div className="font-sans text-sm text-gray-800 space-y-8">
      {/* Header */}
      <div className="text-center pb-4 border-b-2 border-gray-800">
        <h1 className="text-3xl font-bold uppercase tracking-wider">{syllabus.courseName}</h1>
        <p className="text-lg">Plan de Estudio</p>
      </div>

      {/* General Information */}
      <section>
        <h2 className="text-xl font-bold mb-4 border-b border-gray-400 pb-2">1. Información General del Curso</h2>
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
              <td className={tdStyle}>{format(new Date(syllabus.creationDate), 'dd \'de\' MMMM \'de\' yyyy', { locale: es })}</td>
            </tr>
             <tr>
              <td className={`${tdStyle} font-semibold`}>Fecha de última actualización:</td>
              <td className={tdStyle}>{format(new Date(syllabus.updateDate), 'dd \'de\' MMMM \'de\' yyyy', { locale: es })}</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Competencies */}
      <section>
        <h2 className="text-xl font-bold mb-4 border-b border-gray-400 pb-2">2. Gestión de Competencias</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-1">Competencia del Perfil de Egreso:</h3>
            <p className="pl-4">{syllabus.graduateCompetency}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Competencia del Curso:</h3>
            <p className="pl-4">{syllabus.courseCompetency}</p>
          </div>
        </div>
      </section>

      {/* Summary and Prerequisites */}
       <section>
        <h2 className="text-xl font-bold mb-4 border-b border-gray-400 pb-2">3. Resumen y Prerrequisitos</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-1">Competencias Previas Requeridas:</h3>
            <p className="pl-4">{syllabus.prerequisites}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Resumen del Curso:</h3>
            <p className="pl-4">{syllabus.summary}</p>
          </div>
        </div>
      </section>

      {/* Learning Units */}
      <section className="break-after-page">
        <h2 className="text-xl font-bold mb-4 border-b border-gray-400 pb-2">4. Unidades de Aprendizaje</h2>
        {syllabus.learningUnits.map((unit, unitIndex) => (
          <div key={unit.id} className="mb-6">
            <h3 className="text-lg font-semibold mb-2 bg-gray-100 p-2 border border-gray-300">Unidad {unitIndex + 1}: {unit.name}</h3>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr>
                  <th className={`${thStyle} w-[10%]`}>Semana</th>
                  <th className={`${thStyle} w-[30%]`}>Tema/Subtema</th>
                  <th className={`${thStyle} w-[30%]`}>Actividades</th>
                  <th className={`${thStyle} w-[30%]`}>Evidencias</th>
                </tr>
              </thead>
              <tbody>
                {unit.weeks.map((week) => (
                  <tr key={week.id}>
                    <td className={`${tdStyle} text-center`}>{weekCounter()}</td>
                    <td className={tdStyle}>{week.topic}</td>
                    <td className={tdStyle}>{week.activities}</td>
                    <td className={tdStyle}>{week.evidence}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </section>

      {/* Methodology and References */}
      <section>
        <h2 className="text-xl font-bold mb-4 border-b border-gray-400 pb-2">5. Metodología y Referencias</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-1">Metodología:</h3>
            <p className="pl-4">{syllabus.methodology === 'Otro' ? syllabus.customMethodology : syllabus.methodology}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Referencia Bibliográfica (APA):</h3>
            <p className="pl-4 whitespace-pre-wrap">{syllabus.apaReference}</p>
          </div>
        </div>
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
