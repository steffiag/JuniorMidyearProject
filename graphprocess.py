def makegraph(num_nodes, edges):
    graph = [[] for _ in range(num_nodes+1)]
    for l,r in edges:
        graph[l].append(r)
        graph[r].append(l)

