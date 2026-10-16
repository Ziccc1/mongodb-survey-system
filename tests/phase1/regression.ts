import {spawnSync} from 'node:child_process';
const scripts=['tests/integration.test.ts','tests/editor.ts','tests/character-limits.ts','tests/browser.ts'];
for(const script of scripts){console.log(`\nREGRESSION ${script}`);const result=spawnSync(process.execPath,['--env-file=.env','--import','tsx',...(script.endsWith('.test.ts')?['--test','--test-concurrency=1']:[]),script],{encoding:'utf8',cwd:process.cwd(),env:process.env});process.stdout.write(result.stdout??'');process.stderr.write(result.stderr??'');if(result.status!==0)process.exit(result.status??1);}
console.log('EXISTING ACCOUNT/EDITOR/CHARACTER/BROWSER REGRESSION PASSED');
