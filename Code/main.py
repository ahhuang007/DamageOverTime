# -*- coding: utf-8 -*-
"""
Created on Thu Jan 24 15:06:42 2019

@author: Andy
"""

import pandas as pd
import numpy as np
from sqlalchemy import create_engine
from DoTParse import DoTParse
from PatchPatch import PatchPatch
from DoTFiller import DoTFiller
#SQL query code and conversion to Excel file
wk_dir  = 'C:\\Users\\MSI\\Documents\\Github\\DamageOverTimeAnalysis\\'
db_str  = 'mysql+pymysql://LOLMegaRead:'+'LaberLabsLOLquery'+'@lolsql.stat.ncsu.edu/lol'
data_dir = 'D:\\query_data\\dmgovertime\\'
#Getting query data from database
def run_query(query, engine, to_replace, replacers): # filepath of text file that contains query
    for i in range(len(to_replace)):
        old = to_replace[i]
        new = replacers[i]
        query = query.replace(old, str(new))
    df =  pd.read_sql(query,engine)
    
    return df
def split_queries(filepath, engine, n_split, to_replace, replace, savepath):
    
    with open(filepath) as f:
        query_str = f.read()
    query_str = query_str.replace('split_num', str(n_split))
    for j in range(1):
        print(j)
        query_str_part = query_str.replace('snafu', str(j))
        df = run_query(query_str_part, engine, to_replace, replace)
        df.to_csv('D:\\query_data\\dmgovertime\\' + 'dmg_query' + str(j) + '.csv')

n_split = 100
engine = create_engine(db_str)
to_replace = [] 
replace = []

#split_queries(wk_dir + 'Code\\queryone.txt', engine, n_split, to_replace, replace, wk_dir)

sumdf = pd.DataFrame(columns = ["champName", 'gameVersion', 'dmgtaken', 'totaldamagedealttochampions', 't2.gameDuration/60', 'matchid'])
for x in range(n_split):
    print(x)
    df = pd.read_csv(data_dir + 'dmg_query' + str(x) + '.csv')
    df = df.drop(['Unnamed: 0'], 1)
    sumdf = DoTParse(sumdf, df)
    sumdf.fillna(0, inplace = True)

sumdf["dmgtaken/min"] = sumdf["dmgtaken"]/sumdf["t2.gameDuration/60"]
sumdf["dmgdealt/min"] = sumdf["totaldamagedealttochampions"]/sumdf["t2.gameDuration/60"]

sumdf = PatchPatch(sumdf)
sumdf = sumdf.groupby(['champName', 'gameVersion']).agg({'matchid':'sum','dmgtaken/min':'mean','dmgdealt/min':'mean'})
sumdf = sumdf.reset_index(drop = False)

classes = pd.read_csv(data_dir + 'classdata.csv')
sumdf = sumdf.merge(classes, how = 'inner')

colors = {'Assassin':'#ED2941', 'Mage':'#25BAA4', 'Tank':'#393663', 'Fighter':'#664A40', 'Support': '#FFB733', 'Specialist':'#EB8596', 'Marksman':'#0D1F22'}
sumdf["color"] = sumdf['Class'].map(colors)

sumdf.columns = ["champion", "patch", "games", "dmgtaken/min", "dmgdealt/min", "Class", "color"]

sumdf["season"] = np.zeros(len(sumdf))
sumdf["season"] = np.floor(sumdf["patch"]).astype(int)
sumdf["patchnum"] = np.zeros(len(sumdf))
sumdf["patchnum"] = np.round((sumdf["patch"] - sumdf["season"])*100).astype(int)

internals = pd.read_csv(wk_dir + 'Data\\internal_nums.csv')
sumdf = sumdf.merge(internals, how = 'inner')
sumdf.fillna(0, inplace = True)

sumdf = DoTFiller(sumdf)
sumdf = sumdf.reset_index(drop = True)
sumdf = sumdf.sort_values(by = ["internal", "champion"])

gamedf = sumdf.groupby(['champion', 'Class', 'color'],as_index = False) \
        .apply(lambda x: x[['patch','season','patchnum','internal','games']] \
        .to_dict('r')).reset_index() \
        .rename(columns={0:'games'})

dealtdf = sumdf.groupby(['champion', 'Class', 'color'],as_index = False) \
            .apply(lambda x: x[['patch','season','patchnum','internal','dmgdealt/min']] \
            .to_dict('r')).reset_index() \
            .rename(columns={0:'dmgdealt'})
            
takendf = sumdf.groupby(['champion', 'Class', 'color'],as_index = False) \
            .apply(lambda x: x[['patch','season','patchnum','internal','dmgtaken/min']] \
            .to_dict('r')).reset_index() \
            .rename(columns={0:'dmgtaken'}) 
            
finaldf = gamedf.merge(dealtdf)
finaldf = finaldf.merge(takendf)
finaldf.to_json(wk_dir + 'Code\\formdata.json', orient = 'records')

sumdf.to_csv(data_dir + 'dotdata.csv')
sumdf.to_csv(wk_dir + '\\Data\\dotdata.csv')
sumdf.to_json(data_dir + 'dotdata.json', orient = 'records')
sumdf.to_json(wk_dir + '\\Data\\dotdata.json', orient = 'records')