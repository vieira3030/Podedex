import { Injectable, signal, effect, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Pokemon } from '../pokemon-list/pokemon-list'; 

export interface Team {
  id: number;
  name: string;
  pokemons: Pokemon[];
}

@Injectable({ providedIn: 'root' })
export class TeamService {
  teams = signal<Team[]>([{ id: 1, name: 'Equipa 1', pokemons: [] }]);
  activeTeamId = signal<number>(1);
  private isBrowser: boolean;

  // Injetamos o PLATFORM_ID para o Angular nos dizer onde está a correr
  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);

    // 1. Só lê se for mesmo o browser
    if (this.isBrowser) {
      try {
        const saved = localStorage.getItem('my_pokemon_teams');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.length > 0) {
            this.teams.set(parsed);
            this.activeTeamId.set(parsed[0].id); 
          }
        }
      } catch (e) {
        console.error('Erro ao ler do localStorage', e);
      }
    }

    // 2. Só guarda se for mesmo o browser
    effect(() => {
      if (this.isBrowser) {
        localStorage.setItem('my_pokemon_teams', JSON.stringify(this.teams()));
      }
    });
  }

  get activeTeam() {
    return this.teams().find(t => t.id === this.activeTeamId()) || this.teams()[0];
  }

  getTeam() {
    return this.activeTeam.pokemons;
  }

  setActiveTeam(id: number) {
    this.activeTeamId.set(id);
  }

  addTeam() {
    const current = this.teams();
    if (current.length >= 5) {
      alert('Atingiste o limite máximo de 5 equipas!');
      return;
    }
    const newId = current.length > 0 ? Math.max(...current.map(t => t.id)) + 1 : 1;
    this.teams.update(teams => [...teams, { id: newId, name: `Equipa ${newId}`, pokemons: [] }]);
    this.activeTeamId.set(newId); 
  }

  deleteTeam(id: number) {
    if (this.teams().length <= 1) {
      alert('Tens de ter pelo menos uma equipa!');
      return;
    }
    const updated = this.teams().filter(t => t.id !== id);
    this.teams.set(updated);
    if (this.activeTeamId() === id) {
      this.activeTeamId.set(updated[0].id); 
    }
  }

  addPokemon(pokemon: Pokemon) {
    const active = this.activeTeam;
    if (active.pokemons.length >= 6) return alert('A equipa atual já está cheia (máx 6)!');
    if (active.pokemons.some(p => p.id === pokemon.id)) return alert('Já está nesta equipa!');
    
    this.teams.update(teams => teams.map(t => 
      t.id === active.id ? { ...t, pokemons: [...t.pokemons, pokemon] } : t
    ));
  }

  removePokemonFromTeam(pokemonId: number) {
    const activeId = this.activeTeamId();
    this.teams.update(teams => teams.map(t => 
      t.id === activeId ? { ...t, pokemons: t.pokemons.filter(p => p.id !== pokemonId) } : t
    ));
  }

  updateActiveTeamOrder(pokemons: Pokemon[]) {
    const activeId = this.activeTeamId();
    this.teams.update(teams => teams.map(t => 
      t.id === activeId ? { ...t, pokemons: pokemons } : t
    ));
  }
}