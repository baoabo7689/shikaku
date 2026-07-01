'use client';

import { useLanguage } from '@/context/LanguageContext';

export default function HelpPage() {
  const { translations } = useLanguage();

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{translations.help.title}</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">{translations.help.rulesTitle}</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          {translations.help.rules.map((rule: string, idx: number) => (
            <li key={idx} className="text-base">{rule}</li>
          ))}
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">{translations.help.techniquesTitle}</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          {translations.help.techniques.map((technique: string, idx: number) => (
            <li key={idx} className="text-base">{technique}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
