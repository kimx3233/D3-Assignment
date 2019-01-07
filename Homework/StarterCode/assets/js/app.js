// @TODO: YOUR CODE HERE!
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var chartDiv = d3.select("#scatter");



var svg = chartDiv.append("svg")
                  .attr("width", svgWidth)
                  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
                    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "smokes";

// function used for updating x/y-scale var upon click on axis label
function Scale(healthData, chosenAxis) {
  // create scales
  let LinearScale = d3.scaleLinear()
    //if picked Xaxis, set xScale
    if (chosenAxis === "poverty" || chosenAxis === "age"){
        return LinearScale.domain([d3.min(healthData, d => d[chosenAxis]) * 0.8, 
                                   d3.max(healthData, d => d[chosenAxis]) * 1.2]).range([0, width]);
    
    }else {  //setyScale if picked yaxis
        return LinearScale.domain([0, d3.max(healthData, d => d[chosenAxis]*1.2)]).range([height,0]);
    }
}


// function used for updating xAxis var upon click on axis label
function renderAxes(newScale,Axis) {
    //console.log(Axis.attr("class")); 
    if (Axis.attr("class") === "x-axis"){
        let bottomAxis = d3.axisBottom(newScale);

        Axis.transition()
            .duration(1000)
            .call(bottomAxis);

        return Axis;
    
    }else {
        let leftAxis = d3.axisLeft(newScale);
        
        Axis.transition()
            .duration(1000)
            .call(leftAxis);
        
        return Axis;
    }
}

// function used for updating circles group and text groups
// with a transition to new circles/texts
function renderCircles(circlesGroup, newScale, chosenAxis, textGroup) {
    if (chosenAxis === "poverty" || chosenAxis === "age"){
        circlesGroup.transition()
                    .duration(1000)
                    .attr("cx", d => newScale(d[chosenAxis]));

           textGroup.transition()
                    .duration(1000)
                    .attr("x",  d => newScale(d[chosenAxis])-5);
  
        return circlesGroup;
    
    }else {
        circlesGroup.transition()
                    .duration(1000)
                    .attr("cy", d =>newScale(d[chosenAxis]) );

           textGroup.transition()
                    .duration(1000)
                    .attr("y",  d => newScale(d[chosenAxis]) + 2.5  );
  
            return circlesGroup;
    }
}


// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
    
    if (chosenXAxis === "poverty") {
       var xLabel = "% of poor population" ;
    }else{
        var xLabel = "median age of state";
    };
    
    
    if (chosenYAxis === "smokes") {
       var yLabel = "% of smoking population" ;
    }else{
        var yLabel = "% of obese population";
    }

    let toolTip = d3.tip()
                    .attr("class", "tooltip")
                    .offset([80, -60])
                    .html(function(d) {
      return (`${d.state}<br>${xLabel} ${d[chosenXAxis]}<br> ${yLabel} ${d[chosenYAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data, this);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

d3.csv("assets/data/data.csv")
  .then( healthData =>{
      
    //processing data
    healthData.forEach(function(data) {
        //x-labels:
        data.poverty = +data.poverty;
        data.age = +data.age;
        //y-labels:
        data.smokes = +data.smokes;
        data.obesity = +data.obesity;
      });

  //Initialize the graph    
  // x/y LinearScale function above csv import
  var xLinearScale = Scale(healthData, chosenXAxis);
  var yLinearScale = Scale(healthData, chosenYAxis)

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);

  // append initial circles
  var circlesEnter = chartGroup.selectAll("circle")
                            .data(healthData)
                            .enter()
                            .append("g")
                            
  var circlesGroup = circlesEnter.append("circle")
                                .attr("cx", d => xLinearScale(d[chosenXAxis]))
                                .attr("cy", d => yLinearScale(d[chosenYAxis]))
                                .attr("r", 15)
                                .attr("fill", "red")
                                .attr("opacity", ".5");

  //append text to circles
  var textGroup = circlesEnter.append("text")
               .attr("x", d => xLinearScale(d[chosenXAxis]) - 5)
               .attr("y", d => yLinearScale(d[chosenYAxis]) + 2.5)
               .attr("font-size","10")
               .text(d => d.abbr);

  // Create group for 2 x- axis labels
    var xlabelsGroup = chartGroup.append("g")
                                 .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = xlabelsGroup.append("text")
                                    .attr("x", 0)
                                    .attr("y", 20)
                                    .attr("value", "poverty") // value to grab for event listener
                                    .classed("active", true)
                                    .text("In Poverty");
                                    
    var ageLabel = xlabelsGroup.append("text")
                                .attr("x", 0)
                                .attr("y", 40)
                                .attr("value", "age") // value to grab for event listener
                                .classed("inactive", true)
                                .text("Age (Median)");

  // Create group for 2 y- axis labels  
  var ylabelsGroup = chartGroup.append("g")
  .attr("transform", `translate(${0}, ${height/2})`);

  var smokeLabel = ylabelsGroup.append("text")
                                .attr("transform", "rotate(-90)")
                                .attr("x", 0)
                                .attr("y", -40 )
                                .attr("value", "smokes") // value to grab for event listener
                                .classed("active", true)
                                .text("Smokes");
  
  var obesityLabel = ylabelsGroup.append("text")
                                .attr("transform", "rotate(-90)")
                                .attr("x", 0)
                                .attr("y", -60 )
                                .attr("value", "obesity") // value to grab for event listener
                                .classed("inactive", true)
                                .text("Obese (%)");
    //end of initialize the graphs

    // initializeToolTip function above csv import
    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // x axis labels event listener
    xlabelsGroup.selectAll("text")
      .on("click", function() {
        // get value of selection
        let value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {
  
          // replaces chosenXAxis with value
          chosenXAxis = value;
    
          // functions here found above csv import
          // updates x scale for new data
          xLinearScale = Scale(healthData, chosenXAxis);
  
          // updates x axis with transition
          xAxis = renderAxes(xLinearScale, xAxis);
  
          // updates circles with new x values
          circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis,textGroup);
          
          // updates tooltips with new info
          circlesGroup = updateToolTip(chosenXAxis,chosenYAxis, circlesGroup);
  
          // changes classes to change bold text
          if (chosenXAxis === "poverty") {
              povertyLabel
              .classed("active", true)
              .classed("inactive", false);
              ageLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else {
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
              ageLabel
              .classed("active", true)
              .classed("inactive", false);
          }
        }
      });

      // y axis labels event listener
      ylabelsGroup.selectAll("text")
      .on("click", function() {
        // get value of selection
        let value = d3.select(this).attr("value");
        if (value !== chosenYAxis) {
          // replaces chosenXAxis with value
          chosenYAxis = value;
          // functions here found above csv import
          // updates y scale for new data
          yLinearScale = Scale(healthData, chosenYAxis);
  
          // updates y axis with transition
          yAxis = renderAxes(yLinearScale, yAxis);
  
          // updates circles with new y values
          circlesGroup = renderCircles(circlesGroup, yLinearScale, chosenYAxis,textGroup);
          
          // updates tooltips with new info
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
  
          // changes classes to change bold text
          if (chosenYAxis === "smokes") {
            smokeLabel
              .classed("active", true)
              .classed("inactive", false);
            obesityLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else {
            smokeLabel
              .classed("active", false)
              .classed("inactive", true);
            obesityLabel
              .classed("active", true)
              .classed("inactive", false);
          }
        }
      });
})
  .catch(error => console.log(error));  