import React from 'react';

interface ClaimProps {
  title: string;
  totalInterestWibor: string;
  totalInterestNoWibor: string;
  variableRate: string;
  fixedRate: string;
  borrowerBenefit: string;
  benefitPerInstallment: string;
  refund: string;
  futureInterest: string;
}

const Claim: React.FC<ClaimProps> = ({
  title,
  totalInterestWibor,
  totalInterestNoWibor,
  variableRate,
  fixedRate,
  borrowerBenefit,
  benefitPerInstallment,
  refund,
  futureInterest
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div>Suma odsetek:</div>
          <div>WIBOR 3M: {totalInterestWibor}</div>
          <div>BEZ WIBORU: {totalInterestNoWibor}</div>
        </div>
        <div>
          <div>Wysokość raty:</div>
          <div>ZMIENNA AKTUALNA: {variableRate}</div>
          <div>STAŁA BEZ OPROCEN.: {fixedRate}</div>
        </div>
        <div>KORZYŚĆ KREDYTOBIORCY: {borrowerBenefit}</div>
        <div>KORZYŚĆ NA KAŻDEJ RACIE: {benefitPerInstallment}</div>
        <div>Zwrot do Klienta: {refund}</div>
        <div>Wartość anulowanych odsetek na przyszłość: {futureInterest}</div>
      </div>
    </div>
  );
};

export default Claim;
