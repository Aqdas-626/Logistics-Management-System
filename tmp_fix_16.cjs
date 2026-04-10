const fs = require('fs');
const path = require('path');
const files = [
'D:/My Techlape Software/Logistic/Logistic_Ralo/resources/js/Pages/Vessels/Index.jsx',
'D:/My Techlape Software/Logistic/Logistic_Ralo/resources/js/Pages/Swing/Swings/Index.jsx',
'D:/My Techlape Software/Logistic/Logistic_Ralo/resources/js/Pages/ShipTypes/Index.jsx',
'D:/My Techlape Software/Logistic/Logistic_Ralo/resources/js/Pages/Shippings/Index.jsx',
'D:/My Techlape Software/Logistic/Logistic_Ralo/resources/js/Pages/Job/PackageTypes/Index.jsx',
'D:/My Techlape Software/Logistic/Logistic_Ralo/resources/js/Pages/Job/NotificationTypes/Index.jsx',
'D:/My Techlape Software/Logistic/Logistic_Ralo/resources/js/Pages/Job/LocationTypes/Index.jsx',
'D:/My Techlape Software/Logistic/Logistic_Ralo/resources/js/Pages/Job/LiftTypes/Index.jsx',
'D:/My Techlape Software/Logistic/Logistic_Ralo/resources/js/Pages/Job/IsoCodes/Index.jsx',
'D:/My Techlape Software/Logistic/Logistic_Ralo/resources/js/Pages/Job/JobAdditionalInformation/Index.jsx',
'D:/My Techlape Software/Logistic/Logistic_Ralo/resources/js/Pages/Import/Imports/Index.jsx',
'D:/My Techlape Software/Logistic/Logistic_Ralo/resources/js/Pages/Job/DoorTypes/Index.jsx',
'D:/My Techlape Software/Logistic/Logistic_Ralo/resources/js/Pages/Job/Endorsements/Index.jsx',
'D:/My Techlape Software/Logistic/Logistic_Ralo/resources/js/Pages/Export/Exports/Index.jsx',
'D:/My Techlape Software/Logistic/Logistic_Ralo/resources/js/Pages/Customers/Index.jsx',
'D:/My Techlape Software/Logistic/Logistic_Ralo/resources/js/Pages/Cart/Carts/Index.jsx'
];
let changed=0;
for (const file of files){
  let t = fs.readFileSync(file,'utf8');
  const o = t;
  t = t.replace("import {\r\nimport { confirmDelete } from '@/Utils/confirmDelete';\r\n", "import {\r\n");
  t = t.replace("import {\nimport { confirmDelete } from '@/Utils/confirmDelete';\n", "import {\n");
  if(!t.includes("import { confirmDelete } from '@/Utils/confirmDelete';")){
    const lines=t.split(/\r?\n/);
    let insertAt=0;
    for(let i=0;i<lines.length;i++) if(lines[i].startsWith('import ')) insertAt=i+1;
    lines.splice(insertAt,0,"import { confirmDelete } from '@/Utils/confirmDelete';");
    t = lines.join('\n');
  }
  if(t!==o){fs.writeFileSync(file,t,'utf8'); changed++;}
}
console.log('changed_files='+changed);
