# -*- coding: utf-8 -*-
"""
Created on Tue Feb  5 20:42:36 2019

@author: Andy
"""
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

wk_dir = "C:\\Users\\MSI\\Documents\\Github\\DamageOverTimeAnalysis\\"
df = pd.read_csv(wk_dir + "Data\\dotdata.csv")
subset = df[df["champion"] == "Jayce"]

fig, ax = plt.subplots(1, 1, figsize=(10, 5))
plt.xticks(rotation = 70)
ax.plot(subset["patch"], subset["dmgdealt/min"])


    
plt.show()