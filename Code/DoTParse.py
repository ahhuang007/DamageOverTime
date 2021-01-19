# -*- coding: utf-8 -*-
"""
Created on Thu Jan 31 12:00:26 2019

@author: Andy
"""

def DoTParse(sumdf, df):
    df["dmgtaken"] = df["damageselfmitigated"] + df["totaldamagetaken"] + df["totalheal"]
    newdf = df.groupby(['champName', 'gameVersion']).agg({'dmgtaken':'sum','totaldamagedealttochampions':'sum','t2.gameDuration/60':'sum', 'matchid':'count'})
    newdf = newdf.reset_index(drop = False)
    
    newdf = newdf.merge(sumdf, how = 'outer', on = ['champName', 'gameVersion'])
    newdf["dmgtaken"] = newdf['dmgtaken_x'] + newdf['dmgtaken_y']
    newdf["totaldamagedealttochampions"] = newdf["totaldamagedealttochampions_x"] + newdf["totaldamagedealttochampions_y"]
    newdf["t2.gameDuration/60"] = newdf["t2.gameDuration/60_x"] + newdf["t2.gameDuration/60_y"]
    newdf["matchid"] = newdf["matchid_x"] + newdf["matchid_y"]
    newdf = newdf.drop(['dmgtaken_x', 'dmgtaken_y', 'totaldamagedealttochampions_x', 'totaldamagedealttochampions_y', 't2.gameDuration/60_x', 't2.gameDuration/60_y', 'matchid_x', 'matchid_y'], 1)
    
    return newdf