import React, { forwardRef, useEffect, useState } from 'react';
import MaterialTable from 'material-table';
import AddBox from '@material-ui/icons/AddBox';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import Check from '@material-ui/icons/Check';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Clear from '@material-ui/icons/Clear';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import Edit from '@material-ui/icons/Edit';
import FilterList from '@material-ui/icons/FilterList';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import Remove from '@material-ui/icons/Remove';
import SaveAlt from '@material-ui/icons/SaveAlt';
import Search from '@material-ui/icons/Search';
import ViewColumn from '@material-ui/icons/ViewColumn';
import { ark } from './Maps';

const STATS = {
  health: { title: '❤️', ind: 0 },
  stamina: { title: '⚡', ind: 1 },
  torpor: { title: '💫', ind: 2 },
  oxygen: { title: 'O2', ind: 3 },
  food: { title: '🍗', ind: 4 },
  water: { title: '🥛', ind: 5 },
  temperature: { title: '🌡️', ind: 6 },
  weight: { title: '🥌', ind: 7 },
  melee: { title: '⛏️', ind: 8 },
  speed: { title: '🦶', ind: 9 },
};

const tableIcons = {
  Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
  Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
  Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
  DetailPanel: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
  Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
  Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
  FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
  LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
  NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  PreviousPage: forwardRef((props, ref) => <ChevronLeft {...props} ref={ref} />),
  ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
  SortArrow: forwardRef((props, ref) => <ArrowDownward {...props} ref={ref} />),
  ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
  ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />)
};

function tamedStat(field) {
  var { title, ind } = STATS[field];
  return {
    title: title,
    render: data => `${data.baseStats[ind] + data.tamedStats[ind]}/${data.baseStats[ind]}`,
    customSort: (a, b) => a.baseStats[ind] - b.baseStats[ind],
    defaultSort: 'asc',
  }
}

function wildStat(field) {
  var { title, ind } = STATS[field];
  return {
    title: title,
    render: data => data.baseStats[ind],
    customSort: (a, b) => a.baseStats[ind] - b.baseStats[ind],
    defaultSort: 'desc',
  }
}

function lat(data) {
  return {
    title: 'Lat',
    render: data => ark.lat(data.y).toFixed(1),
    customSort: (a, b) => a.y - b.y,
    defaultSort: 'desc',
  }
}

function lon(data) {
  return {
    title: 'Lon',
    render: data => ark.lon(data.x).toFixed(1),
    customSort: (a, b) => a.x - b.x,
  }
}

export default function CreatureTable(props) {
  const { file, title } = props;
  const [data, setData] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [dinoTypes, setTypes] = useState({});

  const COLUMNS = {
    wild: [
      { title: 'Type', field: 'className', lookup: dinoTypes },
      { title: '👫', field: 'isFemale', lookup: { false: '♂️', true: '♀️' } },
      { title: 'LVL', field: 'baseLevel', filtering: false },
      wildStat('health'),
      wildStat('stamina'),
      wildStat('oxygen'),
      wildStat('food'),
      wildStat('weight'),
      wildStat('melee'),
      wildStat('speed'),
      lat(),
      lon(),
    ],
    tames: [
      { title: 'Name', field: 'name' },
      { title: 'Type', field: 'className', lookup: dinoTypes },
      { title: '👫', field: 'isFemale', lookup: { false: '♂️', true: '♀️' } },
      { title: 'LVL', field: 'baseLevel', filtering: false },
      tamedStat('health'),
      tamedStat('stamina'),
      tamedStat('oxygen'),
      tamedStat('food'),
      tamedStat('weight'),
      tamedStat('melee'),
      tamedStat('speed'),
      lat(),
      lon(),
    ]
  };

  useEffect(() => {
    fetch(`${ark.name}/${file}.json`).then(r => r.json()).then(d => {
      let types = new Set();
      for (var dino of d) {
        types.add(dino.className);
      }
      let typeMap = {};
      for (var name of types) {
        typeMap[name] = name.replace('_Character_BP_C', '');
      }
      setTypes(typeMap);
      setData(d);
    });
  }, [file]);

  return <MaterialTable
    icons={tableIcons}
    title={title}
    columns={COLUMNS[file]}
    data={data}
    onRowClick={((evt, selectedRow) => setSelectedRow(selectedRow.tableData.id))}
    detailPanel={data => {
      return <div style={{
        backgroundImage: `url('${ark.inGame.image}')`,
        height: '300px',
        width: '300px',
        backgroundSize: 'contain',
      }}>
        <img src="x.png" alt="X"
          style={{
            position: 'relative',
            display: 'block',
            height: '10px',
            left: `${ark.inGame.x(data.x, 300, 10)}px`,
            top: `${ark.inGame.y(data.y, 300, 10)}px`,
          }}
        />
      </div>
    }}
    options={{
      pageSize: 50,
      pageSizeOptions: [10, 25, 50],
      sorting: true,
      filtering: true,
      padding: 'dense',
      rowStyle: rowData => ({
        backgroundColor: (selectedRow === rowData.tableData.id) ? '#EEE' : '#FFF'
      })
    }}
  />
}
