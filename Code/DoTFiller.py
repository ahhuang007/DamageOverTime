# -*- coding: utf-8 -*-
"""
Created on Tue Mar 12 18:30:06 2019

@author: Andy
"""

import pandas as pd

def DoTFiller(df):
    '''
    Figures out if a champion does not have data for every patch (meaning they
    were released sometime recently), and puts in the appropriate damage
    dealt and taken data from their first actual patch into all previous 
    patches with games played = 0, meaning the data point will be invisible 
    until the champion is actually released.
    '''
    newdf = pd.DataFrame()
    champions = list(df.champion.unique())
    for i in range(len(champions)):
        subset = df[df["champion"] == champions[i]]
        subset = subset.reset_index(drop = True)
        length = len(subset)
        if length != 26:
            missing = 26 - length
            row = subset.iloc[0]
            for j in range(missing):
                newrow = row
                newrow.loc["internal"] = j + 1
                newrow.loc["games"] = 0
                if j + 1 < 25:
                    newrow.loc["patch"] = 8 + ((j + 1) / 100)
                    newrow.loc["season"] = 8
                    newrow.loc["patchnum"] = j + 1
                else:
                    newrow.loc["patch"] = 9 + ((j - 23) / 100)
                    newrow.loc["season"] = 9
                    newrow.loc["patchnum"] = j - 23
                newdf = newdf.append(newrow, sort = True)
            
    df = df.append(newdf, sort = True)
            
    return df
    