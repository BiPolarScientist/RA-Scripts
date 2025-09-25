// Ctrl + ` , then call tsc app.ts to build into a js file to be able to run

import { set, rich } from './src/PS2/24497 - Rugrats Royal Ransom/index'
import * as fs from 'fs'



fs.writeFileSync('./output.txt', set.toString())
fs.writeFileSync('./richoutput.txt', rich.toString())
