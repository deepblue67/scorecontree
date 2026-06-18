/* Manual regression suite for calculateBeloteScore().
   Run from the browser console after loading index.html:
   runScoringRegressionTests()
*/
function runScoringRegressionTests() {
  const contract = (value, preneurTeam='t1', contre='none', isCapot=false) => ({
    value, preneurTeam, contre, isCapot
  });

  const cases = [
    {
      name: 'Sans contrat',
      input: { contract:null, pts1Raw:100, pts2Raw:60, bel1:false, bel2:false, cap1:false, cap2:false },
      expected: { pts1:100, pts2:60, chute:null }
    },
    {
      name: '80 fait sans contre',
      input: { contract:contract(80), pts1Raw:82, pts2Raw:80, bel1:false, bel2:false, cap1:false, cap2:false },
      expected: { pts1:162, pts2:80, chute:false }
    },
    {
      name: '100 chute sans contre',
      input: { contract:contract(100), pts1Raw:90, pts2Raw:72, bel1:false, bel2:false, cap1:false, cap2:false },
      expected: { pts1:0, pts2:260, chute:true }
    },
    {
      name: '100 fait grâce à la belote',
      input: { contract:contract(100), pts1Raw:90, pts2Raw:72, bel1:true, bel2:false, cap1:false, cap2:false },
      expected: { pts1:210, pts2:72, chute:false }
    },
    {
      name: 'Contre fait',
      input: { contract:contract(100, 't1', 'contre'), pts1Raw:110, pts2Raw:52, bel1:false, bel2:false, cap1:false, cap2:false },
      expected: { pts1:360, pts2:0, chute:false }
    },
    {
      name: 'Surcontre chuté avec belote preneur',
      input: { contract:contract(120, 't1', 'surcontre'), pts1Raw:90, pts2Raw:72, bel1:true, bel2:false, cap1:false, cap2:false },
      expected: { pts1:0, pts2:540, chute:true }
    },
    {
      name: 'Capot annoncé réussi',
      input: { contract:contract(250, 't1', 'none', true), pts1Raw:0, pts2Raw:0, bel1:false, bel2:false, cap1:true, cap2:false },
      expected: { pts1:500, pts2:0, chute:false }
    },
    {
      name: 'Capot annoncé chuté',
      input: { contract:contract(250, 't1', 'none', true), pts1Raw:0, pts2Raw:0, bel1:false, bel2:false, cap1:false, cap2:true },
      expected: { pts1:0, pts2:410, chute:true }
    },
    {
      name: 'Capot surprise du preneur',
      input: { contract:contract(100), pts1Raw:0, pts2Raw:0, bel1:false, bel2:false, cap1:true, cap2:false },
      expected: { pts1:350, pts2:0, chute:false }
    },
    {
      name: 'Preneur équipe 2',
      input: { contract:contract(90, 't2'), pts1Raw:62, pts2Raw:100, bel1:false, bel2:false, cap1:false, cap2:false },
      expected: { pts1:62, pts2:190, chute:false }
    }
  ];

  const failures = [];
  cases.forEach(test => {
    const actual = calculateBeloteScore(test.input);
    Object.entries(test.expected).forEach(([key, expected]) => {
      if(actual[key] !== expected) {
        failures.push(`${test.name}: ${key} attendu ${expected}, obtenu ${actual[key]}`);
      }
    });
  });

  if(failures.length) {
    console.error('Tests score échoués', failures);
    return { passed:false, failures };
  }
  console.info(`Tests score réussis : ${cases.length}/${cases.length}`);
  return { passed:true, count:cases.length };
}
