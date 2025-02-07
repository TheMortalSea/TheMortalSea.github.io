```python
import numpy as np
import pandas as pd
import matplotlib
import matplotlib.pyplot as plt
import osmnx as ox # this line imports osmnx
import networkx as nx # this line imports networkx
import matplotlib.cm as cm
import matplotlib.colors as colors

import sys
print (f'current environment: {sys.prefix}')

if ox.__version__=='2.0.1':
    #prints OSMNx version 
    print (f'current osmnx version: {ox.__version__}') 
else:
    #recommends student to upgrade to newer osmnx version.
    print (f'current osmnx version: {ox.__version__}. student might need to upgrade to osmnx=2.0.1 for the notebook to work')
```

    current environment: /Users/main/.pyenv/versions/miniconda3-3.12-24.7.1-0/envs/ox
    current osmnx version: 2.0.0. student might need to upgrade to osmnx=2.0.1 for the notebook to work


# This is a test


```python
G=ox.graph_from_place('San Marino',network_type='drive')
```


```python
ox.plot_graph(G)
```


    
![png](formative_assessment_files/formative_assessment_3_0.png)
    





    (<Figure size 800x800 with 1 Axes>, <Axes: >)




```python

```
