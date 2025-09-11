import json
import os
import re

#
# SETTINGS
#

# Directory where your JSONs are, currently set to the directory this python script is in
directoryName = '.'

# Prints only notes that have been edited
onlyAddEditedNotes = True

# Will only search notes that you are the author of (username in next string)
onlyChangeYourNotes = False
userName = ''

# If there isn't a size at the start of the note, it will search for the first instance of a valid size and write that at the start
insertMissingSizes = False



for filename in os.listdir(directoryName):
    if filename.endswith('-Notes.json'):
        inputJSON = json.loads(open(filename, 'r').read())
        output = open(filename.split('-')[0] + '-CopyIntoUserFile.txt', 'w')

        for note in inputJSON:
            if (not onlyChangeYourNotes) or (note['User'] == userName):
                OriginalCodeNote = note['Note']
                NewCodeNote = OriginalCodeNote

                # Replace all the ##bit with ##-bit
                NewCodeNote = re.sub(r'(?<![bB]it)([0-9]{2,}|[2-9])\s?[bB]it(?=\W)', r'\1-bit', NewCodeNote)

                # Add brackets to a size at the start of the note
                NewCodeNote = re.sub(r'^\s*[\(\{]?'
                                     r'('
                                        r'('
                                             r'([0-9]+-bit(\sBE)?|'
                                             r'[fF]loat(\sBE)?|'
                                             r'[bB]it\s?([fF]ield|[sS]et|[fF]lag)|'
                                             r'[bB]it[cC]ount|'
                                             r'[bB]it[0-7]|'
                                             r'([aA]scii|ASCII)(\s[tT]ext)?|'
                                             r'[dD]ouble\s?32(\sBE)?)'
                                             r'(,?\s*)?'
                                        r')*'
                                        r'('
                                             r'([0-9]+-bit(\sBE)?|'
                                             r'[fF]loat(\sBE)?|'
                                             r'[bB]it\s?([fF]ield|[sS]et|[fF]lag)|'
                                             r'[bB]it[cC]ount|'
                                             r'[bB]it[0-7]|'
                                             r'([aA]scii|ASCII)(\s[tT]ext)?|'
                                             r'[dD]ouble\s?32(\sBE)?)'
                                        r')'
                                     r')'
                                     r'[\]\)\}]?', r'[\1]', NewCodeNote)

                # If there is no size marker present at the start, search the note for the first size and place it at the start with brackets
                if insertMissingSizes:
                    if NewCodeNote.strip()[0] != '[':
                        Size = re.search(r'('
                                             r'[0-9]+-bit(\sBE)?|'
                                             r'[fF]loat(\sBE)?|'
                                             r'[bB]it\s?([fF]ield|[sS]et|[fF]lag)|'
                                             r'[bB]it[cC]ount|'
                                             r'([aA]scii|ASCII)(\s[tT]ext)?|'
                                             r'[dD]ouble\s?32(\sBE)?'
                                             r')', NewCodeNote)
                        if not Size is None:
                            NewCodeNote = '[' + Size.group() + '] ' + NewCodeNote

                if (OriginalCodeNote != NewCodeNote) or not onlyAddEditedNotes:
                    output.write(repr('N0:' + note['Address'] + ':\"' + NewCodeNote + '\"')[1:-1]+ '\n')
