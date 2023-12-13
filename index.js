const margin = { top: 50, right: 30, bottom: 20, left: 50 }
const width = 880
const height = 880
const mat_width = 800
const mat_height = 800

let svg = d3.select('#tp4-viz')
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .attr("id", "adjacencyMatrix")

let tooltip = d3.select('body')
    .append('div')
    .attr('class', 'hidden tooltip')

const createAdjacencyMatrix = (nodes, edges) => {
    var edgeHash = {};
    for (x in edges) {
        var id = edges[x].source + "-" + edges[x].target;
        edgeHash[id] = edges[x];
    }
    matrix = [];
    //create all possible edges
    for (const [a, node_a] of nodes.entries()) {
        for (const [b, node_b] of nodes.entries()) {
            var grid = {id: node_a.id + "-" + node_b.id, x: a, y: b, sharedfollowers: 0};
            if (edgeHash[grid.id]) {
                grid.sharedfollowers = parseInt(edgeHash[grid.id].sharedfollowers);
            }
            matrix.push(grid);
        }
    }
    return matrix;
}

const promises = Promise.all([
    d3.csv("noeuds.csv"),
    d3.csv("liens.csv")
]).then(([nodes, edges]) => {
    const size = mat_width / nodes.length
    const color = d3.scaleQuantize()
        .domain([0, d3.max(edges, e => e.sharedfollowers)])
        .range(d3.schemeOranges[9])

    adj_mat = createAdjacencyMatrix(nodes, edges)
    console.log(adj_mat)    

    let hGuide = d3.select("svg")
        .append("rect")
        .attr("class", "hidden guide")
        .style("stroke", "black")
        .style("stroke-width", "2px")
        .style("fill", "#00000000")
        .attr("width", mat_width)
        .attr("height", size)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    let vGuide = d3.select("svg")
        .append("rect")
        .style("stroke", "black")
        .style("stroke-width", "2px")
        .style("fill", "#00000000")
        .attr("class", "hidden guide")
        .attr("width", size)
        .attr("height", mat_height)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    matrixViz = svg.selectAll("rect")
        .data(adj_mat)
        .join("rect")
        .attr("width", size)
        .attr("height", size)
        .attr("x", (d, i) => {
            return d.x * size
        })
        .attr("y", (d, i) => {
            return d.y * size
        })
        .style("fill", d => color(d.sharedfollowers))
        .on("mousemove", (e, d) => {
            let pos = [e.x, e.y]
            hGuide.classed("hidden", false)
                .attr("y", d.y * size)
            vGuide.classed("hidden", false)
                .attr("x", d.x * size)
            tooltip.classed("hidden", false)
                .attr('style', 'left:' + (pos[0] + 15) + 'px; top:' + (pos[1] - 35) + 'px;')
                .html(d.id + ' ' + d.sharedfollowers)
        })
        .on("mouseout", (e, d) => {
            tooltip.classed("hidden", true)
        })

    const scaleSize = nodes.length * size
    
    const xScale = d3.scaleBand()
        .domain(nodes.map((e) => e.id))
        .range([0, scaleSize])

    const yScale = d3.scaleBand()
        .domain(nodes.map((e) => e.id).reverse())
        .range([scaleSize, 0])
  
    d3.select("#adjacencyMatrix")
    		.append("g")
    		.attr("transform", `translate(0,${nodes.length * size})`)
    		.call(d3.axisBottom(xScale))

    d3.select("#adjacencyMatrix")
    		.append("g")
    		.call(d3.axisLeft(yScale))
})

