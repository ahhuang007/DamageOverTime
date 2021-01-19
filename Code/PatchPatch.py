# -*- coding: utf-8 -*-
"""
Created on Tue Feb  5 21:04:51 2019

@author: Andy
"""


import re
from operator import add
#Turns gameVersion strings into floats, with x.01 being the first patch of a season instead of x.1
def PatchPatch(df):
    #Find numbers in string
    patchnums= df["gameVersion"].apply(lambda x: re.findall(r'\d+', x))
    #Get relevant numbers
    num1 =  [float(x[0]) for x in patchnums]
    num2 =  [float(x[1])/100 for x in patchnums]
    #Add numbers, then assign to df
    sumnum = list(map(add, num1, num2))
    df["gameVersion"] = sumnum
    
    return df