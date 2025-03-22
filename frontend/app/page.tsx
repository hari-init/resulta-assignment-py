"use client"

import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import styles from './page.module.css';
import TeamTable from './components/TeamTable/TeamTable';
import Select from './components/Select/Select';

interface Team {
  id: string;
  name: string;
  nickname: string;
  display_name: string;
  conference: string;
  division: string;
}

interface TeamsData {
  last_updated: string;
  [league: string]: Team[] | string;
}

let socket: Socket;

export default function Home() {
  const [teamsData, setTeamsData] = useState<TeamsData | null>(null);
  const [selectedLeague, setSelectedLeague] = useState<string>('');
  const [selectedSortBy, setSelectedSortBy] = useState<string>('name');
  const [teams, setTeams] = useState<Team[]>([]);
  const [leagues, setLeagues] = useState<string[]>([]);
  const [sortBys, setSortBys] = useState<string[]>([])
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isUpdated, setIsUpdated] = useState<boolean>(false)

  const selectedLeagueRef = useRef(selectedLeague);
  const sortByRef = useRef(selectedSortBy);

  useEffect(() => {
    selectedLeagueRef.current = selectedLeague;
  }, [selectedLeague]);

  useEffect(() => {
    sortByRef.current = selectedSortBy;
  }, [selectedSortBy]);

  const updateTeamsList = (data: TeamsData, league: string, sortOption: string) => {
    const leagueData = data[league];

    if (!Array.isArray(leagueData)) return;

    const sortedTeams = [...leagueData].sort((a, b) => {
      const aValue = a[sortOption as keyof Team];
      const bValue = b[sortOption as keyof Team];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue);
      }

      return 0;
    });

    setTeams(sortedTeams);
  };


  useEffect(() => {
    let progress: NodeJS.Timeout
    if (isUpdated) {
      progress = setTimeout(() => {
        setIsUpdated(false)
      }, 800);
    }

    return () => {
      clearTimeout(progress)
    }
  }, [isUpdated])


  useEffect(() => {
    if (!socket) {
      socket = io('http://localhost:5001');
    }

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    const handleDataUpdate = (data: TeamsData) => {
      console.log('Received data update:', data);
      setIsUpdated(true)
      setTeamsData(data);
      setLastUpdated(new Date(data.last_updated).toLocaleString());


      const leaguesList = Object.keys(data).filter(key => key !== 'last_updated');
      const sortBy = Object.keys(Object.values(data)[0][0]).filter(key => key !== 'id');
      setLeagues(leaguesList);
      setSortBys(sortBy)


      const currentLeague = selectedLeagueRef.current;
      const currentSortBy = sortByRef.current;


      if (currentLeague && data[currentLeague]) {
        updateTeamsList(data, currentLeague, currentSortBy);
      }

      else if (leaguesList.length > 0) {
        const newLeague = leaguesList[0];
        setSelectedLeague(newLeague);
        updateTeamsList(data, newLeague, currentSortBy);
      }
    };


    socket.on('data_update', handleDataUpdate);


    return () => {
      socket.off('data_update', handleDataUpdate);
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);


  const handleLeagueChange = (league: string) => {
    // const newLeague = e.target.value;
    setSelectedLeague(league);
    if (teamsData && teamsData[league]) {
      updateTeamsList(teamsData, league, selectedSortBy);
    }
  };


  const handleSortChange = (sort: string) => {
    // const newSortBy = e.target.value;
    setSelectedSortBy(sort);
    if (teamsData && selectedLeague) {
      updateTeamsList(teamsData, selectedLeague, sort);
    }
  };

  return (
    // <div className={styles.container}>
    //   <main className={styles.main}>
    //     <h1 className={styles.title}>Teams Dashboard</h1>

    //     {lastUpdated && (
    //       <div className={styles.lastUpdated}>
    //         <p>Last Updated: {lastUpdated}</p>
    //       </div>
    //     )}

    //     <div className={styles.controls}>
    //       <div className={styles.selectContainer}>
    //         <label htmlFor="league-select">Select League:</label>
    //         <select
    //           id="league-select"
    //           value={selectedLeague}
    //           onChange={handleLeagueChange}
    //           className={styles.select}
    //           disabled={leagues.length === 0}
    //         >
    //           {leagues.map(league => (
    //             <option key={league} value={league}>{league}</option>
    //           ))}
    //         </select>
    //       </div>

    //       <div className={styles.selectContainer}>
    //         <label htmlFor="sort-select">Sort By:</label>
    //         <select
    //           id="sort-select"
    //           value={sortBy}
    //           onChange={handleSortChange}
    //           className={styles.select}
    //         >
    //           <option value="name">Name</option>
    //           <option value="nickname">Nickname</option>
    //           <option value="display_name">Display Name</option>
    //           <option value="conference">Conference</option>
    //           <option value="division">Division</option>
    //         </select>
    //       </div>
    //     </div>

    //     <div className={styles.teamsGrid}>
    //       {teams.map(team => (
    //         <div key={team.id} className={styles.teamCard}>
    //           <h2>{team.display_name}</h2>
    //           <p><strong>Name:</strong> {team.name}</p>
    //           <p><strong>Nickname:</strong> {team.nickname}</p>
    //           <p><strong>Conference:</strong> {team.conference}</p>
    //           <p><strong>Division:</strong> {team.division}</p>
    //         </div>
    //       ))}
    //     </div>
    //   </main>
    // </div>
    <div className={styles.wrapper}>
      <div className={styles.controlsCenter}>
        <div className={styles.controls} >
          <Select selectedLeague={selectedLeague} handleChange={(league) => handleLeagueChange(league)} leagues={leagues} label='League' />
          <Select selectedLeague={selectedSortBy} handleChange={(sort) => handleSortChange(sort)} leagues={sortBys} label='Sort by' />
        </div>
        <div className={styles.status}>
          <div className={styles.socket}>
            SocketIO: <span style={{ backgroundColor: isConnected ? '#4caf50b3' : '#e91e1e8a' }}>{isConnected ? 'Connected' : 'Disconnected'} </span>
          </div>
          Last Updated: {lastUpdated.split(',')[1]}
        </div>
      </div>
      <div className={styles.container}>
        {isUpdated ? <span className={styles.loader}></span> : ''}
        <TeamTable isHead={true} list={teams} />
        <TeamTable isHead={false} list={teams} />
      </div>
    </div>
  );
}