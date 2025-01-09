  import TemporalProgression from './temporal-progression';
  import RatioSuperspot from './ratio-superspot';
  import MostSpottedBrand from './most-spotted-brand';
  import MostFollowed from './most-followed'
  import SpotTemporalEvolution from './spot-temporal-evolution'
  import TimeBetweenSpot from './time-between-spot';
  import FollowersRatioChart from './follower-following-ratio';
// Composant pour les statistiques utilisateur
const UserStats = () => {
  
    return (
      <div className="flex flex-wrap gap-4">
        <RatioSuperspot />
        <MostSpottedBrand />
        <TemporalProgression />
        <MostFollowed />
        <SpotTemporalEvolution />
        <TimeBetweenSpot />
        <FollowersRatioChart />
      </div>
    );
  };

export default UserStats;
