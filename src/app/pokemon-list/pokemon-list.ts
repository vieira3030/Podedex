import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms'; 
import { PokemonService } from '../services/pokemon';
import { TeamService } from '../services/team';
import { PokemonCardComponent } from '../pokemon-card/pokemon-card';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';

export interface Pokemon {
  id: number;
  name: string;
  url: string;
  image: string;
  animatedImage: string;
  types?: string[]; 
  stats?: { name: string; value: number }[]; // NOVO: Guarda as stats
}

@Component({
  selector: 'app-pokemon-list',
  standalone: true,
  imports: [FormsModule, PokemonCardComponent, DragDropModule],
  templateUrl: './pokemon-list.html',
  styleUrl: './pokemon-list.css'
})
export class PokemonListComponent implements OnInit {
  private pokemonService = inject(PokemonService);
  private teamService = inject(TeamService); 
  private cdr = inject(ChangeDetectorRef); 
  
  pokemons: Pokemon[] = []; 
  displayedPokemons: Pokemon[] = []; 
  searchTerm: string = ''; 
  
  limit = 20; 
  offset = 0; 
  isLoading = false; 
  removedPokemonIds: number[] = []; 
  hoveredType: string = ''; 

  // NOVO: Controlo da Janela Modal
  selectedPokemon: Pokemon | null = null;

  ngOnInit() {
    this.loadPokemons();
  }

  get myTeam() { return this.teamService.getTeam(); }
  get allTeams() { return this.teamService.teams; } 
  get activeTeamId() { return this.teamService.activeTeamId; } 

  switchTeam(id: number) { this.teamService.setActiveTeam(id); }
  createNewTeam() { this.teamService.addTeam(); }
  deleteTeam(id: number, event: Event) { 
    event.stopPropagation(); 
    this.teamService.deleteTeam(id); 
  }

  isPokemonInTeam(id: number): boolean {
    return this.myTeam.some(p => p.id === id);
  }

  drop(event: CdkDragDrop<Pokemon[]>) {
    const currentTeam = [...this.myTeam]; 
    moveItemInArray(currentTeam, event.previousIndex, event.currentIndex);
    this.teamService.updateActiveTeamOrder(currentTeam);
  }

  // NOVO: Abrir/Fechar Modal
  openModal(pokemon: Pokemon) { this.selectedPokemon = pokemon; }
  closeModal() { this.selectedPokemon = null; }

  loadPokemons() {
    this.isLoading = true;
    this.cdr.detectChanges(); 

    this.pokemonService.getPokemons(this.limit, this.offset).subscribe({
      next: (data) => {
        this.pokemons = data.results.map((pokemon) => {
          const partes = pokemon.url.split('/').filter(p => p !== '');
          const id = Number(partes[partes.length - 1]);

          const novoPokemon: Pokemon = {
            id: id,
            name: pokemon.name,
            url: pokemon.url,
            image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
            animatedImage: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${id}.gif`,
            types: [],
            stats: []
          };

          fetch(pokemon.url)
            .then(res => res.json())
            .then(details => {
              novoPokemon.types = details.types.map((t: any) => t.type.name);
              // NOVO: Extrair as Stats da API
              novoPokemon.stats = details.stats.map((s: any) => ({
                name: s.stat.name,
                value: s.base_stat
              }));
            });

          return novoPokemon;
        });
        
        this.filterList();
        this.isLoading = false; 
        this.cdr.detectChanges(); 
      },
      error: (erro) => {
        console.error('Erro na ligação à API:', erro);
        this.isLoading = false; 
        this.cdr.detectChanges(); 
      }
    });
  }

  addToTeam(pokemon: Pokemon, event: Event) {
    event.stopPropagation(); 
    this.teamService.addPokemon(pokemon);
  }

  removeFromTeam(id: number, event: Event) {
    event.stopPropagation();
    this.teamService.removePokemonFromTeam(id);
  }

  removePokemon(id: number, event: Event) {
    event.stopPropagation();
    this.removedPokemonIds.push(id); 
    this.filterList(); 
  }

  onHover(pokemon: Pokemon) {
    this.playSound(pokemon.id);
    if (pokemon.types && pokemon.types.length > 0) {
      this.hoveredType = 'bg-' + pokemon.types[0]; 
    }
  }

  onLeave() {
    this.hoveredType = ''; 
  }

  playSound(id: number) {
    const audio = new Audio(`https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`);
    audio.volume = 0.15; 
    audio.play().catch(() => {});
  }

  nextPage() {
    if (this.isLoading) return; 
    this.offset += this.limit; 
    this.loadPokemons();
  }

  previousPage() {
    if (this.isLoading) return; 
    if (this.offset >= this.limit) { 
      this.offset -= this.limit;
      this.loadPokemons();
    }
  }

  filterList() {
    const listaSemApagados = this.pokemons.filter(p => !this.removedPokemonIds.includes(p.id));

    if (!this.searchTerm) {
      this.displayedPokemons = [...listaSemApagados]; 
    } else {
      this.displayedPokemons = listaSemApagados.filter((p) =>
        p.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }
}