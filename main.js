var _    = require('underscore-node');
var util = require('util');
var repo = require('./meap');

function selectTrees (children) {
  return children.reduce(function (directoryDependent, element, index) {
    if ( element.type == 'tree' || element.path.indexOf('/') !== -1 ) {
      directoryDependent.push(element);
      children[index] = undefined;
    }

    return directoryDependent;
  }, []);
}

function findParentDirs (filesWithDirectories) {
  return filesWithDirectories.map(function (file) { return file.path.split('/') }).
                              filter(function (pathArr) { return pathArr.length == 1 }).
                              map(function (dir) { return dir[0] });
}

function removeParentDir (file) {
  var fileArr = file.path.split('/');
  fileArr.shift();
  file.path = fileArr.join('/');
  return file;
}

function childrenOfParentDir (files, parentDir) {
  // searches for only those files which have the same parent dir
  var childrenFiles = _.filter(files, function (file) {
    return file.path !== parentDir && file.path.split('/')[0] == parentDir;
  });

  // removes the parent dir (e.g. 'src/client/styles' --> 'client/styles')
  var childrenWithoutParentPaths = childrenFiles.map(removeParentDir);

  return childrenWithoutParentPaths;
}

function destructiveReject (array, rejectItem) {
  while ( array.indexOf(rejectItem) !== -1 ) {
    var i = array.indexOf(rejectItem);
    array.splice(i, 1);
  }

  return array;
}

function constructTree (children) {
  var filesWithDirectories = selectTrees(children),
      parentDirs           = findParentDirs(filesWithDirectories);

  destructiveReject(children);

  return parentDirs.forEach(function (dir) {    
    var childPaths = childrenOfParentDir(filesWithDirectories, dir);
    children.push({ name: dir, children: childPaths });
    
    var newChildren = _.findWhere(children, { name: dir }).children;
    constructTree(newChildren);
  });
}

// Setup

var myRepo = { name: repo.name, children: repo.tree };
constructTree(myRepo.children)
console.log(util.inspect(myRepo, false, null));
