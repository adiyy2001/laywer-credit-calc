import{u as l,j as e,m}from"./index-CMplX-lx.js";import"./vendor-B9B04VyU.js";const p=()=>{const i=l(t=>{var s;return((s=t.calculator.results)==null?void 0:s.installmentsFirstClaim3M)||[]}),c=l(t=>{var s;return((s=t.calculator.results)==null?void 0:s.installmentsFirstClaim6M)||[]}),d=t=>new Date(t).toLocaleDateString("pl-PL"),n=t=>t.toLocaleString("pl-PL",{minimumFractionDigits:2,maximumFractionDigits:2}),a=(t,s)=>e.jsxs("div",{className:"w-full",children:[e.jsx("h3",{className:"text-lg font-medium mb-2",children:s}),e.jsxs("table",{className:"min-w-full bg-white border mb-4",children:[e.jsx("thead",{className:"bg-gray-200",children:e.jsxs("tr",{children:[e.jsx("th",{className:"py-2 px-4 border",children:"Data"}),e.jsx("th",{className:"py-2 px-4 border text-right",children:"Kapitał (zł)"}),e.jsx("th",{className:"py-2 px-4 border text-right",children:"Odsetki (zł)"}),e.jsx("th",{className:"py-2 px-4 border text-right",children:"Pozostało"}),e.jsx("th",{className:"py-2 px-4 border text-right",children:"Rata"}),e.jsx("th",{className:"py-2 px-4 border text-right",children:"MARŻA (%)"})]})}),e.jsx("tbody",{children:t.map((r,x)=>e.jsxs("tr",{className:"even:bg-gray-50",children:[e.jsx("td",{className:"border px-4 py-2",children:d(r.date)}),e.jsx("td",{className:"border px-4 py-2 text-right",children:r.principal}),e.jsx("td",{className:"border px-4 py-2 text-right",children:n(parseFloat(r.interest))}),e.jsx("td",{className:"border px-4 py-2 text-right",children:r.remainingAmount}),e.jsx("td",{className:"border px-4 py-2 text-right",children:r.totalPayment}),e.jsx("td",{className:"border px-4 py-2 text-right",children:r.wiborRate})]},x))})]})]});return e.jsxs(m.div,{className:"container mx-auto mt-12 p-6 bg-white rounded-lg shadow-lg",children:[e.jsx("h2",{className:"text-3xl font-bold mb-6 text-center",children:"Szczegóły Spłaty Ratalnej - I Roszczenie Ewentualne"}),e.jsxs("div",{className:"flex flex-wrap -mx-2",children:[e.jsx("div",{className:"w-full md:w-1/2 px-2",children:a(i,"WIBOR 3M")}),e.jsx("div",{className:"w-full md:w-1/2 px-2",children:a(c,"WIBOR 6M")})]})]})};export{p as default};