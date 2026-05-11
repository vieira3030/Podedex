import { Component } from '@angular/core';
import { PokemonListComponent } from './pokemon-list/pokemon-list';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [PokemonListComponent], // Só precisamos de carregar a lista!
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  title = 'pokedex-app';
}