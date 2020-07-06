import React, { useContext } from 'react';
import { AppContext } from 'context/AppContext';
import { NavSection } from '../NavSection';

export function NavGroup() {
    const { currentUser } = useContext(AppContext);
    return (
        <div className="NavGroup">
            { /* TODO: Use custom emoji here */ }
            <NavSection
                icon="sazerac"
                title="Recipes"
                description="Search the cocktail recipes and find something new."
                href="/recipes"
            />
            <NavSection
                icon="menu"
                title="Build Lists"
                description="Keep track of what you've tried and what you like, or bookmark drinks to try later."
                href={ `/users/${currentUser.username}/lists` }
            />
            <NavSection
                icon="liquor"
                title="Manage Your Liquor Cabinet"
                description="Track the bottles you have to find drinks you can make with what you have on hand."
                href={ `/users/${currentUser.username}/cabinet` }
            />
            <NavSection
                icon="jigger"
                title="Add Recipes"
                description="Add your favorite recipes to the database and share with others."
                href="/new"
            />
        </div>
    );
}
