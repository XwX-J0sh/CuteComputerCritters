package com.CuteComputerCritters.backend.api.model;

import com.CuteComputerCritters.backend.api.model.Critter.CritterEvolutions;
import com.CuteComputerCritters.backend.api.model.Food.EnumFoodType;
import com.CuteComputerCritters.backend.api.model.Food.Food;
import com.CuteComputerCritters.backend.api.model.User.EnumRole;
import com.CuteComputerCritters.backend.api.model.User.Role;
import com.CuteComputerCritters.backend.api.model.medicine.EnumMedicineType;
import com.CuteComputerCritters.backend.api.model.medicine.Medicine;
import com.CuteComputerCritters.backend.api.repository.CritterEvolutionsRepository;
import com.CuteComputerCritters.backend.api.repository.FoodRepository;
import com.CuteComputerCritters.backend.api.repository.MedicineRepository;
import com.CuteComputerCritters.backend.api.repository.RoleRepository;
import lombok.AllArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import static com.CuteComputerCritters.backend.api.model.medicine.EnumMedicineType.BAND_AID;

@Component
@AllArgsConstructor
//Data seeder fills tables with initial necessary information such as foods, medicine and role types
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final FoodRepository foodRepository;
    private final MedicineRepository medicineRepository;
    private final CritterEvolutionsRepository critterEvolutionsRepository;

    @Override
    public void run(String... args) {
        //Role types
        if(roleRepository.count() == 0) {
            roleRepository.save(new Role(EnumRole.USER));
            roleRepository.save(new Role(EnumRole.ADMIN));
        }

        //medicine
        if(medicineRepository.count() == 0) {
            medicineRepository.save(new Medicine(EnumMedicineType.BAND_AID));
            medicineRepository.save(new Medicine(EnumMedicineType.PILL));
        }

        //foods
        if(foodRepository.count() == 0) {
            foodRepository.save(new Food("Cake", EnumFoodType.SNACK, 3));
            foodRepository.save(new Food("Bread", EnumFoodType.MEAL, 5));
            foodRepository.save(new Food("Candy", EnumFoodType.SNACK, 1));
            foodRepository.save(new Food("Pizza", EnumFoodType.MEAL, 4));
            foodRepository.save(new Food("Rice", EnumFoodType.MEAL, 5));
        }

        //critterevolutions
        if(critterEvolutionsRepository.count() == 0){
            critterEvolutionsRepository.save(new CritterEvolutions(1.0, 30, 5, 1, 1, 50, 50, 1, "Baby"));
            critterEvolutionsRepository.save(new CritterEvolutions(2.0, 30, 5, 2, 2, 40, 40, 1, "Chiikawa"));
            critterEvolutionsRepository.save(new CritterEvolutions(2.1, 30, 5, 2, 1, 30, 50, 1.5, "Hachiware"));
            critterEvolutionsRepository.save(new CritterEvolutions(2.2, 30, 5, 1, 1, 20, 30, 2, "Schisa"));
            critterEvolutionsRepository.save(new CritterEvolutions(2.3, 25, 10, 3, 1, 60, 60, 0.75, "Usagi"));
            critterEvolutionsRepository.save(new CritterEvolutions(2.4, 30, 10, 3, 3, 60, 80, 0.5,"Momonga"));
        }
    }
}
