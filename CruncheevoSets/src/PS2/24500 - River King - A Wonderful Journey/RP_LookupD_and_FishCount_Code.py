# Reads all the diary entries as unaligned 16-bit and ignores 0xffff's, that way the last entry written
# will be 0xffYZ and will be selected as the maximum by the lookout
output = ''

# Takes in convential order of areas and spits out proper memory order
areacodeconversion = [0,2,4,1,3,5]
# How many diary entries in that area to check, if the next one is written in, consider area complete
entriestocheck = [21, 14, 12, 15, 16, 0]
# How far is the diary for the area offset from the start of the diary?
entryoffsets = [0, 0x1b, 0x2b, 0x3a, 0x4d, 0x64]

# A = area code (game logic), B = Diary entry number, C = string of what you want the measured at the end added by
def base( A, B, C ):
    return (# Sets up remember to have a pointer to the character you're playing as Area code
            'A:0xT491cf4*279160_B:0xN491cf4*113920_K:6097128_I:{recall}_I:0xX0_A:0xX44*4_I:{recall}_K:0xX0+4760' +
            # Tests if that area code matches the area you are in
            '_I:{recall}_Q:0xX0' +
            ('=' if A < 5 else '>=') +str(
            A) +
            # Sets up remember to have a pointer to the start of your character's diary
            '_A:0xT491cf4*279160_B:0xN491cf4*113920_K:6097128_I:{recall}_I:0xX0_A:0xX44*101_I:{recall}_K:0xX0+24096' +
            # Checks the diary entry in question isn't 0xffff, and then measures it with offset desired (0x90*area)
            '_I:{recall}+'+str(
            B)+'_K:0x0_Q:{recall}!=65535_M:{recall}' + C
            )

# A = area code (play time order)
def finishedarea( A ):
    return (# Sets up remember to have a pointer to the character you're playing as Area code
            'A:0xT491cf4*279160_B:0xN491cf4*113920_K:6097128_I:{recall}_I:0xX0_A:0xX44*4_I:{recall}_K:0xX0+4760' +
            # checks area code matches the one you are in
            '_I:{recall}_Q:0xX0'+
            ('=' if A < 5 else '>=') + str(
            areacodeconversion[A]) +
            # Sets up remember to have a pointer to the start of your character's diary
            '_A:0xT491cf4*279160_B:0xN491cf4*113920_K:6097128_I:{recall}_I:0xX0_A:0xX44*101_I:{recall}_K:0xX0+24096' +
            # Checks that the last entry of the area's diary isn't 0xff
            '_I:{recall}+' + str(
            entriestocheck[A] + entryoffsets[A]) + '_K:0xH0_Q:{recall}!=255' +
            # Measure 0xfe[Area]
            '_M:' + str(0xfe00 + A)
            )


def fresharea( A ):
    return (# Sets up remember to have a pointer to the character you're playing as Area code
            'A:0xT491cf4*279160_B:0xN491cf4*113920_K:6097128_I:{recall}_I:0xX0_A:0xX44*4_I:{recall}_K:0xX0+4760'+
            # checks area code matches the one you are in
            '_I:{recall}_Q:0xX0'+
            ('=' if A < 5 else '>=') + str(
            areacodeconversion[A]) +
            # Sets up remember to have a pointer to the start of your character's diary
            '_A:0xT491cf4*279160_B:0xN491cf4*113920_K:6097128_I:{recall}_I:0xX0_A:0xX44*101_I:{recall}_K:0xX0+24096' +
            # Checks that the first entry of the area's diary is 0xff
            '_I:{recall}+' + str(
            entryoffsets[A]) + '_K:0xH0_Q:{recall}=255' +
            # Measure 0xfd[Area]
            '_M:' + str(0xfd00 + A)
    )


for area in range(0,5):
    for diary in range(0,entriestocheck[area]):
        if area != 0:
            additional = '+' + str(area * 0x90)
        else:
            additional = ''
        output += base(areacodeconversion[area],diary + entryoffsets[area],additional) + '$'
    output += fresharea(area) + '$'
    output += finishedarea(area) + '$'
output += fresharea(5) + '$'
output += finishedarea(5)


print(output)





# Outputs how many different fish you've caught as a character

# Offsets you to fish i's caught amount if recall has a pointer to the start of your records
def line1(i):
    return 'I:{recall}+' + str (20 + 24 * i)
# Addsource 1 if you've caught the fish, otherwise add 0
line2 = 'A:0xX0/0xX0'

# Sets up remember to house a pointer to the start of your records list
output2 = 'A:0xT491cf4*279160_B:0xN491cf4*113920_K:6097128_I:{recall}_I:0xX0_A:0xX44*3268_I:{recall}_K:0xX0+7568_'

for i in range(0, 136):
    output2 += line1(i) + '_' + line2 + '_'
output2 += 'M:0'

print(output2)