```python
# imports the various library for the lab
import numpy as np
import pandas as pd
import matplotlib
import matplotlib.pyplot as plt
import osmnx as ox # this line imports osmnx
import networkx as nx # this line imports networkx
import matplotlib.cm as cm
import matplotlib.colors as colors
#from IPython.display import IFrame
#ox.config(log_console=True, use_cache=True)

import sys
print (f'current environment: {sys.prefix}')

if ox.__version__=='2.0.1':
    #prints OSMNx version 
    print (f'current osmnx version: {ox.__version__}') 
else:
    #recommends student to upgrade to newer osmnx version.
    print (f'current osmnx version: {ox.__version__}. student might need to upgrade to osmnx=2.0.1 for the notebook to work')
```

    current environment: /Users/main/.pyenv/versions/miniconda3-3.12-24.7.1-0/envs/Mining_env
    current osmnx version: 2.0.1



```python
G=ox.graph_from_address('Piazza Camillo Benso Cavour, Ancona', dist=2000)
```


```python
ox.plot_graph(G)
```


    
![png](formative_assessment_files/formative_assessment_2_0.png)
    





    (<Figure size 800x800 with 1 Axes>, <Axes: >)




```python
DG = ox.convert.to_digraph(G)
```


```python
edge_bc = nx.betweenness_centrality(nx.line_graph(DG))
edge_cc = nx.closeness_centrality(nx.line_graph(DG))
edge_dc = nx.degree_centrality(nx.line_graph(DG))
nx.set_edge_attributes(DG, edge_bc,'bc')
nx.set_edge_attributes(DG, edge_cc,'cc')
nx.set_edge_attributes(DG, edge_dc,'dc')
G1 = nx.MultiGraph(DG)
```


```python
nc = ox.plot.get_edge_colors_by_attr(G1, 'cc', cmap='plasma')
fig, ax = ox.plot_graph(G1, node_size=0, node_color='w', node_edgecolor='gray', node_zorder=2,
                        edge_color=nc, edge_linewidth=1.5, edge_alpha=1)
```


    
![png](formative_assessment_files/formative_assessment_5_0.png)
    



```python
nc = ox.plot.get_edge_colors_by_attr(G1, 'bc', cmap='plasma')
fig, ax = ox.plot_graph(G1, node_size=0, node_color='w', node_edgecolor='gray', node_zorder=2,
                        edge_color=nc, edge_linewidth=1.5, edge_alpha=1)
```


    
![png](formative_assessment_files/formative_assessment_6_0.png)
    



```python
nc = ox.plot.get_edge_colors_by_attr(G1, 'dc', cmap='plasma')
fig, ax = ox.plot_graph(G1, node_size=0, node_color='w', node_edgecolor='gray', node_zorder=2,
                        edge_color=nc, edge_linewidth=1.5, edge_alpha=1)
```


    
![png](formative_assessment_files/formative_assessment_7_0.png)
    



```python
import osmnx as ox
from shapely.geometry import Point, box
import pandas as pd

def get_points_within_radius(center_point, dist, tags):
    """
    Get POIs within radius of a center point.
    """
    # Create bounding box for the radius
    bbox = ox.utils_geo.bbox_from_point(center_point, dist=dist)
    
    # Get POIs within the box
    pois = ox.features.features_from_bbox(bbox, tags)
    
    # Convert to points list
    points = []
    if not pois.empty:
        for idx, row in pois.iterrows():
            if row.geometry.geom_type == 'Point':
                points.append((row.geometry.y, row.geometry.x))
            elif row.geometry.geom_type in ['Polygon', 'MultiPolygon']:
                centroid = row.geometry.centroid
                points.append((centroid.y, centroid.x))
    
    return points

def get_retail_points_radius(address, dist):
    """Get retail points within radius of address"""
    center_point = ox.geocoder.geocode(address)
    retail_tags = {
        'shop': True,
        'amenity': ['marketplace', 'shopping_mall'],
        'building': ['retail', 'supermarket']
    }
    return get_points_within_radius(center_point, dist, retail_tags)

def get_transit_points_radius(address, dist):
    """Get transit points within radius of address"""
    center_point = ox.geocoder.geocode(address)
    transit_tags = {
        'railway': ['station', 'subway_entrance', 'tram_stop'],
        'highway': ['bus_stop'],
        'amenity': ['bus_station']
    }
    return get_points_within_radius(center_point, dist, transit_tags)
```


```python
import osmnx as ox
import networkx as nx
import pandas as pd
import matplotlib.pyplot as plt
from shapely.geometry import Point

def analyze_retail_locations(G, retail_points=None, transit_points=None):
    # Calculate different centrality metrics
    degree_centrality = nx.degree_centrality(G)
    closeness_centrality = nx.closeness_centrality(G)
    betweenness_centrality = nx.betweenness_centrality(G)
    
    # Create a DataFrame with node metrics
    metrics_df = pd.DataFrame({
        'node_id': list(G.nodes()),
        'degree_centrality': list(degree_centrality.values()),
        'closeness_centrality': list(closeness_centrality.values()),
        'betweenness_centrality': list(betweenness_centrality.values())
    })
    
    # Get node coordinates
    metrics_df['lat'] = metrics_df['node_id'].apply(lambda x: G.nodes[x]['y'])
    metrics_df['lon'] = metrics_df['node_id'].apply(lambda x: G.nodes[x]['x'])
    
    # If retail points are provided, calculate distances to existing retail
    if retail_points:
        metrics_df['dist_to_nearest_retail'] = metrics_df.apply(
            lambda row: min(
                ox.distance.great_circle(row['lat'], row['lon'], rlat, rlon)
                for rlat, rlon in retail_points
            ),
            axis=1
        )
    
    # If transit points are provided, calculate distances to transit
    if transit_points:
        metrics_df['dist_to_nearest_transit'] = metrics_df.apply(
            lambda row: min(
                ox.distance.great_circle(row['lat'], row['lon'], tlat, tlon)
                for tlat, tlon in transit_points
            ),
            axis=1
        )
    
    # Find optimal locations based on combined metrics
    metrics_df['combined_score'] = (
        metrics_df['degree_centrality'] +
        metrics_df['closeness_centrality'] +
        metrics_df['betweenness_centrality']
    )
    
    if transit_points:
        # Weight locations closer to transit more heavily
        metrics_df['combined_score'] -= metrics_df['dist_to_nearest_transit'] / metrics_df['dist_to_nearest_transit'].max()
    
    # Get top locations
    top_locations = metrics_df.nlargest(5, 'combined_score')
    
    return {
        'metrics_df': metrics_df,
        'top_locations': top_locations
    }

def plot_analysis_results(G, analysis_results, retail_points=None, transit_points=None):
    fig, ax = plt.subplots(figsize=(15, 15))
    
    # Plot the street network
    ox.plot_graph(G, ax=ax, node_size=0, edge_color='gray', edge_alpha=0.2)
    
    # Plot centrality scores
    node_colors = analysis_results['metrics_df']['combined_score']
    node_sizes = analysis_results['metrics_df']['combined_score'] * 100
    
    ox.plot_graph(G, ax=ax, node_color=node_colors, node_size=node_sizes, 
                 edge_color='gray', edge_alpha=0.2, cmap='YlOrRd')
    
    # Plot existing retail locations if provided
    if retail_points:
        retail_lats, retail_lons = zip(*retail_points)
        ax.scatter(retail_lons, retail_lats, c='blue', s=100, label='Existing Retail')
    
    # Plot transit locations if provided
    if transit_points:
        transit_lats, transit_lons = zip(*transit_points)
        ax.scatter(transit_lons, transit_lats, c='green', s=100, label='Transit Stations')
    
    # Plot top recommended locations
    top_locs = analysis_results['top_locations']
    ax.scatter(top_locs['lon'], top_locs['lat'], c='red', s=200, 
              label='Recommended Locations')
    
    ax.legend()
    plt.title('Retail Location Analysis')
    return fig, ax
  
```


```python
address = 'Piazza Camillo Benso Cavour, Ancona'
dist = 2000

retail_points = get_retail_points_radius(address, dist)
transit_points = get_transit_points_radius(address, dist)
```


```python
def plot_points_on_network(G, retail_points=None, transit_points=None):
    """
    Plot retail and transit points on the network.
    """
    # Create basic network plot
    fig, ax = ox.plot_graph(G, show=False, close=False, node_size=0)
    
    # Plot retail points if provided
    if retail_points and len(retail_points) > 0:
        retail_lats, retail_lons = zip(*retail_points)
        ax.scatter(retail_lons, retail_lats, c='red', s=5, alpha=0.5, label='Retail')
    
    # Plot transit points if provided
    if transit_points and len(transit_points) > 0:
        transit_lats, transit_lons = zip(*transit_points)
        ax.scatter(transit_lons, transit_lats, c='yellow', s=5, alpha= 0.5, label='Transit')
    
    ax.legend()
    return fig, ax

fig, ax = plot_points_on_network(G, retail_points, transit_points)
plt.show()
```


    
![png](formative_assessment_files/formative_assessment_11_0.png)
    



```python
analysis = analyze_retail_locations(G, retail_points, transit_points)
```


```python
top_locations = analysis['top_locations']
print(top_locations.head())

```

           node_id  degree_centrality  closeness_centrality  \
    211  127864740           0.001270              0.036024   
    247  132325678           0.001905              0.034941   
    88    99079217           0.001905              0.036289   
    848  428450827           0.001270              0.035110   
    87    99079204           0.001905              0.036567   
    
         betweenness_centrality        lat        lon  dist_to_nearest_retail  \
    211                0.171313  43.612254  13.507066              167.230545   
    247                0.114565  43.606553  13.510326                6.522067   
    88                 0.168662  43.613543  13.507047              114.662540   
    848                0.139950  43.610000  13.515917               41.842109   
    87                 0.171018  43.612657  13.507771              213.347091   
    
         dist_to_nearest_transit  combined_score  
    211                49.911348        0.170154  
    247                 5.929406        0.146844  
    88                 91.810002        0.136123  
    848                54.884355        0.134047  
    87                102.240479        0.130722  



```python
top_points = 
```


```python
def plot_points_on_network(G, retail_points=None, transit_points=None):
    """
    Plot retail and transit points on the network.
    """
    # Create basic network plot
    nc = ox.plot.get_edge_colors_by_attr(G1, 'cc', cmap='plasma')
    fig, ax = ox.plot_graph(G1, node_size=0, node_color='w', node_edgecolor='gray', node_zorder=2,
                            edge_color=nc, edge_linewidth=1.5, edge_alpha=1)
    
    # Plot top recommended locations (using lat and lon from the dataframe)
    if retail_points and len(retail_points) > 0:
        retail_lats = analysis['top_locations']['lat']  # Extract latitudes
        retail_lons = analysis['top_locations']['lon']  # Extract longitudes
        ax.scatter(retail_lons, retail_lats, c='red', s=50, alpha=0.5, label='Top Locations')

    
    ax.legend()
    return fig, ax

fig, ax = plot_points_on_network(G, retail_points, transit_points)
plt.show()
```


    
![png](formative_assessment_files/formative_assessment_15_0.png)
    



```python
print(analysis)
```

    {'metrics_df':           node_id  degree_centrality  closeness_centrality  \
    0        59841750           0.001270              0.031961   
    1        59841751           0.000953              0.023812   
    2        59841823           0.001270              0.033253   
    3        59841824           0.001588              0.024691   
    4        59852988           0.001270              0.030092   
    ...           ...                ...                   ...   
    3145  12593108461           0.000635              0.025022   
    3146  12593108468           0.001270              0.024797   
    3147  12593108470           0.000635              0.024197   
    3148  12593113741           0.000635              0.025228   
    3149  12593113742           0.001905              0.025881   
    
          betweenness_centrality        lat        lon  dist_to_nearest_retail  \
    0                   0.047545  43.616378  13.519208               10.267149   
    1                   0.003252  43.615074  13.532908               44.617231   
    2                   0.063804  43.616244  13.519139               18.141401   
    3                   0.016236  43.614911  13.532925               38.985202   
    4                   0.018319  43.614827  13.524219               15.304531   
    ...                      ...        ...        ...                     ...   
    3145                0.000000  43.621425  13.511719              180.719808   
    3146                0.007723  43.621190  13.511413              144.872971   
    3147                0.000000  43.621243  13.511205              138.043482   
    3148                0.000000  43.621460  13.511944              194.357250   
    3149                0.016695  43.621446  13.511883              191.882863   
    
          dist_to_nearest_transit  combined_score  
    0                   29.864570        0.057768  
    1                   51.844925       -0.011925  
    2                   21.616287        0.081674  
    3                   36.244175        0.014592  
    4                   80.017624       -0.011965  
    ...                       ...             ...  
    3145                25.240080        0.006211  
    3146                12.475184        0.024179  
    3147                21.314278        0.008411  
    3148                43.023868       -0.007283  
    3149                37.895514        0.015286  
    
    [3150 rows x 9 columns], 'top_locations':        node_id  degree_centrality  closeness_centrality  \
    211  127864740           0.001270              0.036024   
    247  132325678           0.001905              0.034941   
    88    99079217           0.001905              0.036289   
    848  428450827           0.001270              0.035110   
    87    99079204           0.001905              0.036567   
    
         betweenness_centrality        lat        lon  dist_to_nearest_retail  \
    211                0.171313  43.612254  13.507066              167.230545   
    247                0.114565  43.606553  13.510326                6.522067   
    88                 0.168662  43.613543  13.507047              114.662540   
    848                0.139950  43.610000  13.515917               41.842109   
    87                 0.171018  43.612657  13.507771              213.347091   
    
         dist_to_nearest_transit  combined_score  
    211                49.911348        0.170154  
    247                 5.929406        0.146844  
    88                 91.810002        0.136123  
    848                54.884355        0.134047  
    87                102.240479        0.130722  }



```python
# Assuming your dictionary is stored in `data`


```

        node_id  degree_centrality  closeness_centrality  betweenness_centrality  \
    0  59841750           0.001270              0.031961                0.047545   
    1  59841751           0.000953              0.023812                0.003252   
    2  59841823           0.001270              0.033253                0.063804   
    3  59841824           0.001588              0.024691                0.016236   
    4  59852988           0.001270              0.030092                0.018319   
    
             lat        lon  dist_to_nearest_retail  dist_to_nearest_transit  \
    0  43.616378  13.519208               10.267149                29.864570   
    1  43.615074  13.532908               44.617231                51.844925   
    2  43.616244  13.519139               18.141401                21.616287   
    3  43.614911  13.532925               38.985202                36.244175   
    4  43.614827  13.524219               15.304531                80.017624   
    
       combined_score  
    0        0.057768  
    1       -0.011925  
    2        0.081674  
    3        0.014592  
    4       -0.011965  



```python
print(top_locations.head())

```

           node_id  degree_centrality  closeness_centrality  \
    211  127864740           0.001270              0.036024   
    247  132325678           0.001905              0.034941   
    88    99079217           0.001905              0.036289   
    848  428450827           0.001270              0.035110   
    87    99079204           0.001905              0.036567   
    
         betweenness_centrality        lat        lon  dist_to_nearest_retail  \
    211                0.171313  43.612254  13.507066              167.230545   
    247                0.114565  43.606553  13.510326                6.522067   
    88                 0.168662  43.613543  13.507047              114.662540   
    848                0.139950  43.610000  13.515917               41.842109   
    87                 0.171018  43.612657  13.507771              213.347091   
    
         dist_to_nearest_transit  combined_score  
    211                49.911348        0.170154  
    247                 5.929406        0.146844  
    88                 91.810002        0.136123  
    848                54.884355        0.134047  
    87                102.240479        0.130722  



```python
fig, ax = plot_analysis_results(G, analysis, retail_points, transit_points)

```


    ---------------------------------------------------------------------------

    TypeError                                 Traceback (most recent call last)

    Cell In[84], line 1
    ----> 1 fig, ax = plot_analysis_results(G, analysis, retail_points, transit_points)


    Cell In[83], line 35, in plot_analysis_results(G, analysis_results, retail_points, transit_points)
         32 nx.set_node_attributes(G, node_sizes.to_dict(), 'node_size')
         34 # 5. Plot the graph with color and size based on attributes
    ---> 35 ox.plot_graph(
         36     G,
         37     ax=ax,
         38     node_color='combined_score',  # Use the attribute for color
         39     node_size='node_size',  # Use the attribute for size
         40     edge_color='gray',
         41     edge_alpha=0.2,
         42     show=False,
         43     close=False
         44 )
         46 # ... (rest of your plotting code for retail, transit, recommendations)
         47 if retail_points:


    File ~/.pyenv/versions/miniconda3-3.12-24.7.1-0/envs/Mining_env/lib/python3.12/site-packages/osmnx/plot.py:244, in plot_graph(G, ax, figsize, bgcolor, node_color, node_size, node_alpha, node_edgecolor, node_zorder, edge_color, edge_linewidth, edge_alpha, bbox, show, close, save, filepath, dpi)
        242 max_node_size = max(node_size) if isinstance(node_size, Sequence) else node_size
        243 max_edge_lw = max(edge_linewidth) if isinstance(edge_linewidth, Sequence) else edge_linewidth
    --> 244 if max_node_size <= 0 and max_edge_lw <= 0:  # pragma: no cover
        245     msg = "Either `node_size` or `edge_linewidth` must be > 0 to plot something."
        246     raise ValueError(msg)


    TypeError: '<=' not supported between instances of 'str' and 'int'



    
![png](formative_assessment_files/formative_assessment_19_1.png)
    



```python

```
