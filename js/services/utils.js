app.service("Utils", function(){
    var self = this;
    
    self.minFigure = function(coords){
        var min_row = _.minBy(coords, "row").row;
        var min_column = _.minBy(coords, "column").column;
        return  _.map(coords, function(coords){
            return {row: coords.row - min_row, column: coords.column - min_column}
        });
    };
    
    self.getChains = function(cells){
        var groups = [];
        var checked = [];

        for(var i = 0, len = cells.length; i < len; i++){
            if(!_.find(checked, cells[i])){
                var group = [cells[i]];
                findNeighbors(cells[i], group, checked);
                groups.push(group);
            }
        }

        function findNeighbors(element, group, checked){
            checked.push(element);

            var neighbors = [
                {row: element.row - 1, column: element.column},
                {row: element.row, column: element.column + 1},
                {row: element.row + 1, column: element.column},
                {row: element.row, column: element.column - 1},
            ];

            for(var i = 0, len = neighbors.length; i < len; i++){
                var neighbor = _.find(cells, neighbors[i]);
                if(neighbor && !_.find(checked, neighbors[i])){
                    group.push(neighbor);
                    findNeighbors(neighbor, group, checked);
                }
            }	
        }
        
        return groups;
    };
});