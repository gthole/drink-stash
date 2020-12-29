import React from 'react';
import { useHistory } from 'react-router-dom';
import './style.css';
import { Activity } from 'components/Activity';
import { SearchBar } from 'components/SearchBar';
import { Card } from 'components/Structure';
import { NavGroup } from 'pages/Home/NavGroup';


export function Home() {
    const history = useHistory();

    const params = {};

    return (
        <div className="Home">
            <div className="home-left">
                <Card className="home-search">
                    <SearchBar
                        total={ null }
                        subtext={ 'e.g. cynar, Last Word, or mezcal' }
                        setValue={ (q) => history.push('/recipes/?search=' + encodeURIComponent(q), {}) }
                    />
                </Card>
                <Card className="home-main">
                    <NavGroup />
                </Card>
            </div>
            <div className="home-right">
                <Card className="home-activity">
                    <div className="activity-pane">
                        <Activity
                            showTitle={ true }
                            params={ params }
                        />
                    </div>
                </Card>
            </div>
        </div>
    );
}
